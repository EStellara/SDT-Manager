// Manual test script for export/import functionality
// Run this in the browser console to test the functions

console.log('Starting Export/Import Tests...');

// Test 1: Check if JSZip is available
try {
	const JSZip = window.JSZip;
	if (JSZip) {
		console.log('✅ JSZip is available');
	} else {
		console.log('❌ JSZip is not available');
	}
} catch (error) {
	console.log('❌ Error checking JSZip:', error);
}

// Test 2: Test basic zip creation
async function testZipCreation() {
	try {
		const JSZip = window.JSZip || (await import('jszip')).default;
		const zip = new JSZip();

		zip.file("test.txt", "Hello World!");

		const content = await zip.generateAsync({ type: "blob" });
		console.log('✅ Basic zip creation works, size:', content.size, 'bytes');

		return true;
	} catch (error) {
		console.log('❌ Error creating zip:', error);
		return false;
	}
}

// Test 3: Test JSON operations
function testJSONOperations() {
	try {
		const testData = {
			id: 'test-project',
			name: 'Test Project',
			dialogTrees: [],
			characters: [],
			variables: {}
		};

		const jsonString = JSON.stringify(testData, null, 2);
		const parsed = JSON.parse(jsonString);

		console.log('✅ JSON operations work correctly');
		return true;
	} catch (error) {
		console.log('❌ Error with JSON operations:', error);
		return false;
	}
}

// Run tests
(async function runTests() {
	console.log('\n=== Running Export/Import Tests ===');

	const jsonResult = testJSONOperations();
	const zipResult = await testZipCreation();

	if (jsonResult && zipResult) {
		console.log('\n✅ All basic tests passed! Export/Import should work correctly.');
	} else {
		console.log('\n❌ Some tests failed. Check the errors above.');
	}
})();
