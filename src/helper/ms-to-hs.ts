export function formatTime(ms: number): string {
    const totalMinutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    const hrLabel = hours === 1 ? 'hr' : 'hrs';
    const minLabel = minutes === 1 ? 'min' : 'mins';

    return `${hours}${hrLabel}: ${minutes}${minLabel}`;
}