import '@fontsource/source-sans-pro/400.css';
import '@fontsource/source-sans-pro/600.css';
import "../Layout/styles.css";

export default function Impressum() {
    return (
        <>
            <h2 className='normHeadline'>Das ist eine Fallstudie in Software Engineering von Studierenden der IU Internationale Hochschule.</h2>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Hauptverantwortlich für den Inhalt der Seite ist:
                <br />
                Andreas Gruber
                <br />
                Im Wiesengrund 6, 83362 Surberg
                <br />
            </p>
            <br/>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Es handelt sich um ein privates Studienprojekt ohne gewerblichen Zweck.
            </p>
            <br />
            <br />

            <h4 className='normHeadline'>
                Haftung für Links
            </h4>

            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Unser Projekt enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
            </p>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
            <h4 className='normHeadline'>
                Urheberrecht
            </h4>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
            </p>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
            </p>
            <p className='normText' style={{marginTop: 5, marginBottom: 5}}>
                Für die Erstellung dieser Webseite wurde Open Source Software verwendet.
            </p>
        </>
    )
}