import { addDoc, collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { Button } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
  
export default function QuestionsUpload() {

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
      });
    

  // function to initialize firestore database from JSON
  async function addQuestions(courseId, questions) {
    const questionsCollectionRef = collection(firestore, `courses/${courseId}/questions`);
    let indices = [];
    for (let question of questions) {
      let newQuestionData = {
        ...question,
        authorId: "09AL5V15OMQwn9joaEg173C6wAo2",
        reviewed: true,
        reviewerID: "9aDzk0yaA9NlLjF9S1ZUZVrSyVm2"
      };
      let newQuestionRef = await addDoc(questionsCollectionRef, newQuestionData);
      console.log("Added question: ", newQuestionData);
      indices.push(newQuestionRef.id);
    }
    const indexRef = doc(firestore, `courses/${courseId}/questions`, "index_reviewed");
    await setDoc(indexRef, { indices });
    createIndex();
  }

  const handleFileUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const questions = JSON.parse(e.target.result);
          await addQuestions(activeCourse.id, questions);
          console.log("Questions uploaded successfully");
        } catch (error) {
          console.error("Error parsing JSON file: ", error);
        }
      };
      reader.readAsText(file);
    }
  };

  async function createIndex() {
    try {
      console.log("indexing");
      const questionsCollectionRef = collection(firestore, `courses/1dNndTHIF9OoukU5rqvE/questions`);
      const querySnapshot = await getDocs(questionsCollectionRef);
      let indices = [];
      querySnapshot.forEach((doc) => {
        indices.push(doc.id);
      });
      const indexRef = doc(firestore, `courses/1dNndTHIF9OoukU5rqvE/questions`, "index_reviewed");
      await setDoc(indexRef, { indices: indices });
      console.log("indexing done");
    }
    catch (error) { console.error("Fehler beim Index.", error.message) }
  }

  return (
    <Button
    component="label"
    role={undefined}
    variant="contained"
    tabIndex={-1}
    startIcon={<CloudUploadIcon />}
  >
    Upload files
    <VisuallyHiddenInput
      type="file"
      onChange={(event) => handleFileUpload(event)}
      multiple
    />
  </Button>
  );
}
