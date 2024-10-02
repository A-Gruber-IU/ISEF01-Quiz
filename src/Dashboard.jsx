import { useActiveCourse } from "./User/useActiveCourse";
import { useFirebase } from "./useFirebase";
import { ActiveCourseDisplay } from "./Startpage/ActiveCourseDisplay";

import { BarChart } from "@mui/x-charts";

import Grid from "@mui/material/Grid2";
import "@fontsource/source-sans-pro/700.css";
import "./Layout/styles.css";

export default function Dashboard() {
  const { activeCourse, loading, updateActiveCourse } = useActiveCourse();

  function handleChangeCourse(courseId) {
    updateActiveCourse(courseId);
  }

  return (
    <>
      <h4 className="normHeadline">Willkommen auf dem Dashboard!</h4>
      <Grid container spacing={4} marginTop={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ActiveCourseDisplay
            activeCourse={activeCourse}
            loading={loading}
            handleChangeCourse={handleChangeCourse}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <BarChart
            xAxis={[
              { scaleType: "band", data: ["group A", "group B", "group C"] },
            ]}
            series={[
              { data: [4, 3, 5] },
              { data: [1, 6, 3] },
              { data: [2, 5, 6] },
            ]}
            width={500}
            height={300}
          />
        </Grid>
      </Grid>
    </>
  );
}
