import { useCallback, useRef, useState } from "react";

interface UseDragAndDropProps {
	onFileDrop: (files: FileList) => void;
	accept?: string[];
}

export function useDragAndDrop({ onFileDrop, accept = [".json", ".zip"] }: UseDragAndDropProps) {
	const dragCounter = useRef(0);
	const [isDragOver, setIsDragOver] = useState(false);
	const handleDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current++;

		if (e.dataTransfer?.items) {
			// Add visual feedback class
			e.currentTarget.classList.add("drag-over");
			setIsDragOver(true);
		}
	}, []);
	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current--;

		if (dragCounter.current === 0) {
			// Remove visual feedback class
			e.currentTarget.classList.remove("drag-over");
			setIsDragOver(false);
		}
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Set the dropEffect to indicate this is a valid drop target
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "copy";
		}
	}, []);
	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		dragCounter.current = 0;

		// Remove visual feedback class
		e.currentTarget.classList.remove("drag-over");
		setIsDragOver(false);

		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			// Filter files by accepted extensions if specified
			const acceptedFiles: File[] = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				const extension = "." + file.name.split(".").pop()?.toLowerCase();

				if (accept.length === 0 || accept.includes(extension)) {
					acceptedFiles.push(file);
				}
			}

			if (acceptedFiles.length > 0) {
				// Create a FileList-like object with proper indexing
				const fileList = Object.assign(acceptedFiles, {
					length: acceptedFiles.length,
					item: (index: number) => acceptedFiles[index] || null
				}) as FileList;

				onFileDrop(fileList);
			}
		}
	}, [onFileDrop, accept]);
	return {
		dragProps: {
			onDragEnter: handleDragEnter,
			onDragLeave: handleDragLeave,
			onDragOver: handleDragOver,
			onDrop: handleDrop,
		},
		isDragOver
	};
}
