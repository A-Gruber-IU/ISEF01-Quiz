import { BarChart } from "@mui/x-charts";

export default function Dashboard() {
    return (
        <>
            <p>Willkommen auf dem Dashboard!</p>
            <BarChart
                xAxis={[{ scaleType: 'band', data: ['group A', 'group B', 'group C'] }]}
                series={[{ data: [4, 3, 5] }, { data: [1, 6, 3] }, { data: [2, 5, 6] }]}
                width={500}
                height={300}
            />
            <p>Wow, beeindruckende Leistung!</p>
        </>
    );
}