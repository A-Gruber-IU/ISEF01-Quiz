import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import '@fontsource/source-sans-pro/400.css';
import "../Layout/styles.css";
import { Typography } from '@mui/material';

export default function Faqs() {

  const frequentlyAskedQuestions = [
    {
      questionId: "0001",
      question: "Was ist das hier?",
      answer: "Ein Studienprojekt von Studierenden der IU Internationale Hochschule. Die App ist nicht zur produktiven Verwendung vorgesehen."
    },
    {
      questionId: "0002",
      question: "Mit wem kann ich hier spielen?",
      answer: "Vorerst ist die Nutzung der App nur für die Entwickler, Testnutzer und den Tutor für das Projekt Software Engineering freigegeben. Ihr findet also in der Regel noch keine echten Mitspieler."
    },
    {
      questionId: "0003",
      question: "Kann ich einen neuen Nutzer registrieren?",
      answer: "Grundsätzlich ist in der App eine Registrierung implementiert. Voraussetzung für eine Registrierung ist dabei eine Email-Adresse der IU, die auf &quot;iu-study.org&quot; endet. Für den aktuellen Prototypen ist die Registrierung allerdings deaktiviert."
    },
  ];

  return (
    <div>
      {frequentlyAskedQuestions.map((faq) => (
        <Accordion sx={{backgroundColor: "#efedee"}} key={faq.questionId}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1-content"
            id="panel1-header"
          >
            <Typography
              component="div"
              className='normText'
              sx={{
                display: 'flex',
                alignItems: 'center',
                '& > :first-of-type': {
                  fontWeight: 'bold',
                  minWidth: '150px',
                  marginRight: 2,
                },
              }}
            >
              <span>{faq.question}</span>
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
          <Typography
              component="div"
              className='normText'
              sx={{
                display: 'flex',
                alignItems: 'center',
                '& > :first-of-type': {
                  fontWeight: '400',
                  minWidth: '150px',
                  marginRight: 2,
                },
              }}
            >
              <span>{faq.answer}</span>
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}