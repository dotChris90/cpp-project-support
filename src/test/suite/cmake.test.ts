import * as assert from 'assert';
import {CMake} from '../../CMake';
import {} from '../../Executor';

suite('cmake Test Suite', () => {
	
    test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});
