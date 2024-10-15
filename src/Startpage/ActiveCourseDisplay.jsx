import { Card, CardContent, CardMedia, Typography, CircularProgress } from '@mui/material';
import { CourseSelector } from './CourseSelector';

export function ActiveCourseDisplay({ activeCourse, loading, handleChangeCourse }) {
  if (loading) {
    return <CircularProgress />;
  }

  if (!activeCourse) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h5" component="div">
            Kein Kurs ausgewählt
          </Typography>
          <CourseSelector activeCourse={{ image_path: "", long_name: "", short_name: "", id: "" }} handleChangeCourse={handleChangeCourse} />
        </CardContent>
      </Card>
    );
  }

  else if (activeCourse && activeCourse.imageUrl && activeCourse.long_name && activeCourse.short_name) {
    return (
      <Card>
        <CardMedia
          component="img"
          height="200"
          width="200"
          image={activeCourse.imageUrl}
          alt={activeCourse.long_name}
        />
        <CardContent>
          <Typography variant="h5" component="div">
            {activeCourse.long_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeCourse.short_name}
          </Typography>
          <CourseSelector activeCourse={activeCourse} handleChangeCourse={handleChangeCourse} />
        </CardContent>
      </Card>
    );
  }
}