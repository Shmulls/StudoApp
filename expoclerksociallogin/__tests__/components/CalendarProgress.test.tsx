const { render, screen } = require('@testing-library/react-native');
const CalendarProgress = require('../../components/CalendarProgress');

test('hello world!', () => {
	render(<CalendarProgress />);
	const element = screen.getByText(/hello world/i);
	expect(element).toBeTruthy();
});