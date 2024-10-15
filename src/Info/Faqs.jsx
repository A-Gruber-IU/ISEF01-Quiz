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
    {
      questionId: "0004",
      question: "Was ist der Singleplayer-Modus?",
      answer: "Im Single-Player-Modus trainierst du selbständig im von dir gewünschten Kurs. Ziel ist es die Fragen innert möglichst kurzer Zeit korrekt zu beantworten. Das Spiel des von dir gewählten Kurses (gemäss Kurs-Lobby) startet, sobald du auf «Singleplayer-Modus» geklickt hast."
    },
    {
      questionId: "0005",
      question: "Was ist der Coop-Modus?",
      answer: "Im Coop-Modus trainierst du zusammen mit einem anderen User im von euch gewünschten Kurs (Kursauswahl gemäss Kurs-Lobby). Tausche dich optimalerweise zuerst dafür im Lobby-Chat (Hauptmenü) mit einem anderen User aus. Das gemeinsame Spiel startet, sobald ihr beide auf «Coop-Modus» geklickt habt (und denselben Kurs ausgewählt habt). Innerhalb eines Spiels gelangt ihr jeweils zur nächsten Frage, wenn ihr euch kooperativ auf eine gemeinsame Antwort geeinigt habt. Nutzt zur gemeinsamen Lösungsfindung den in der Session integrierten «Private-Chat». "
    },
    {
      questionId: "0006",
      question: "Was ist der Competition-Modus?",
      answer: "Im Competition-Modus spielst du gegen einen anderen User im von euch gewünschten Kurs (Kursauswahl gemäss Kurs-Lobby). Tausche dich optimalerweise zuerst dafür im Lobby-Chat (Hauptmenü) mit einem anderen User aus. Das gemeinsame Spiel startet, sobald ihr beide auf «Competition-Modus» geklickt habt (und denselben Kurs ausgewählt habt). Innerhalb der Spiel-Session könnt ihr zudem im «Private-Chat» miteinander kommunizieren. "
    },
    {
      questionId: "0007",
      question: "Was bedeutet «Frage einreichen»?",
      answer: "Hier kannst du aktiv beim Fragekatalog der jeweiligen Kurse mitwirken. Reiche hier einen Vorschlag für eine Frage ein. Sobald deine Frage (und deine Antwortmöglichkeiten) von einem anderen User freigegeben wurde (Frage reviewen), wird deine Frage in den Fragekatalog übernommen."
    },
    {
      questionId: "0008",
      question: "Was bedeutet «Frage reviewen»?",
      answer: "Reviewe hier die Fragen (und Antwortmöglichkeiten), welche andere User zur Integration in den Fragekatalog vorgeschlagen haben. Du kannst diese «genehmigen» oder «ablehnen». Ein Review deiner eigenen Fragen ist nicht möglich."
    },
    {
      questionId: "0009",
      question: "Was mache ich in der Kurs-Lobby? ",
      answer: "Vor jedem Spiel wählst du in der Kurs-Lobby den Kurs aus, in welchem du trainieren möchtest. Unter «wer ist online» siehst du, welche User ebenfalls in denselben Kurs eingewählt sind und ob von diesen ein Coop- und/oder Competition Spiel gewünscht wird. Nutze zudem den Lobby-Chat, um dich mit den anderen im Kurs anwesenden Usern auszutauschen und dich für ein Spiel (z.B. im Competition- oder Coop-Modus) zu vereinbaren."
    },
    {
      questionId: "0010",
      question: "Wie kann ich eine Frage zu dieser App stellen?",
      answer: "Bitte schreibe eine E-Mail an andreas.gruber1@iu-study.org und stelle deine Frage. Wir werden diese dann dir per E-Mail beantworten und falls nötig ins FAQ aufnehmen."
    },
    {
      questionId: "0011",
      question: "Was ist das Dashboard? ",
      answer: "Das Dashboard informiert dich über deinen persönlichen Lernfortschritt."
    },
    {
      questionId: "0012",
      question: "Was für unterschiedliche Chat-Funktionen gibt es in der App?",
      answer: "Du kannst einerseits auf der Hauptseite dich mit Usern austauschen, welche denselben Kurs gewählt haben. Innerhalb eines Spiels (Coop-Modus oder Comp-Modus) kannst du dich zudem mit deinem Spielpartner «privat» austauschen."
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