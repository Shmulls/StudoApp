const { renderHook } = require('@testing-library/react-hooks');
const useTasks = require('../../hooks/useTasks');

test('hello world!', () => {
	const { result } = renderHook(() => useTasks());
	expect(result.current).toBeDefined();
});