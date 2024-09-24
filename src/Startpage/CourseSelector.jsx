import { useState, useEffect } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { ref as storageRef, getDownloadURL } from 'firebase/storage'
import { Card, CardContent, CardMedia, Typography, Button, Dialog, CircularProgress, DialogContent, DialogTitle } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { useFirebase } from '../useFirebase'

export function CourseSelector({ activeCourse, handleChangeCourse }) {
  const [coursesData, setCoursesData] = useState([])
  const [userCourses, setUserCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const { auth, storage, firestore } = useFirebase()
  const activeUser = auth.currentUser

  useEffect(() => {
    async function fetchUserCourses() {
      try {
        if (activeUser) {
          console.log("Active user ID:", activeUser.uid)
          const userDoc = await getDoc(doc(firestore, 'users', activeUser.uid))
          setUserCourses(userDoc.data().courses)
          console.log("userDoc.data().courses: ", userDoc.data().courses)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }
    fetchUserCourses()
  }, [activeUser, firestore])

  useEffect(() => {
    async function fetchCoursesData() {
      try {
        const coursePromises = userCourses.map(async (courseId) => {
          const courseDoc = await getDoc(doc(firestore, 'courses', courseId))
          console.log("Fetching course data:", courseDoc)
          if (courseDoc.exists()) {
            const data = courseDoc.data()
            const imageUrl = await getDownloadURL(storageRef(storage, data.image_path))
            return {
              id: courseDoc.id,
              ...data,
              imageUrl
            }
          }
        })
        const resolvedCourses = await Promise.all(coursePromises)
        setCoursesData(resolvedCourses.filter(course => course !== null)) // Filter out null values
      } catch (error) {
        console.error('Error:', error)
      }
      setLoading(false)
    }
    fetchCoursesData()
  }, [firestore, storage, userCourses])

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSelectCourse = (id) => {
    handleChangeCourse(id)
    handleClose()
    console.log("Setting new active course with ID: ", id)
  }

  if (loading) {
    return <CircularProgress />
  }

  return (
    <>
      <Button onClick={handleOpen} variant="contained" color="primary" sx={{ marginTop: 2 }}>
        Kurs ändern
      </Button>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            height: "90vh",
            maxHeight: "90vh",
          }
        }}
      >
        <DialogTitle>Wähle einen Kurs</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ padding: 2 }}>
            {coursesData.map((course) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={course.imageUrl}
                    alt={course.long_name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div">
                      {course.long_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {course.short_name}
                    </Typography>
                  </CardContent>
                  <Button
                    onClick={() => handleSelectCourse(course.id)}
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={course.id === activeCourse.id}
                    sx={{ mt: 'auto', mb: 2, mx: 2 }}
                  >
                    Auswählen
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </>
  )
}