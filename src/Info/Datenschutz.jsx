import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';
import "../Layout/styles.css";

export default function Datenschutz() {

    return (
        <div>
            <div>
                <h2 className='normHeadline'>Datenschutzerklärung</h2>
                <div className='normText'>
                    <p>
                        Das ist ein Studenprojekt zur Softwareentwicklung und keine echte Seite. Im Rahmen des Projekts werden nur beispielhafte, fiktive Daten verarbeitet. Wenn Sie die Seite als Testnutzer nutzen, geben Sie bitte keinen echten personenbezogenen Daten ein.
                    </p>
                    <p>
                        Alle möglicherweise gespeicherten Nutzerdaten werden zum Ende des Projekts gelöscht.
                    </p>
                    <p>
                        Zur Datenverarbeitung werden Dienste von Firebase, einem Produkt von Google Cloud, eingesetzt. Weitere Informationen dazu sind in den entsprechenden <a href="https://firebase.google.com/support/privacy?hl=de">Datenschutzbestimmungen</a> enthalten.
                    </p>
                    <p>
                        Verantwortlich für die Verarbeitung der Daten ist:
                        <br />
                        Andreas Gruber
                        <br />
                        Im Wiesengrund 6
                        <br />
                        83362 Surberg
                    </p>
                </div>
            </div>
        </div >
    );
}