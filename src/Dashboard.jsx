import { useEffect, useState } from 'react';
import { useActiveCourse } from "./User/useActiveCourse";
import { useFirebase } from "./useFirebase";
import { ActiveCourseDisplay } from "./Startpage/ActiveCourseDisplay";
import { BarChart, PieChart } from "@mui/x-charts";
import { Card, CardContent, Typography } from '@mui/material';
import Grid from "@mui/material/Grid2";
import "@fontsource/source-sans-pro/700.css";
import "./Layout/styles.css";
import { doc, getDoc } from 'firebase/firestore';

export default function Dashboard() {
  const { activeCourse, loading, updateActiveCourse } = useActiveCourse();
  const { firestore, auth } = useFirebase();
  const [gameStats, setGameStats] = useState(null);

  const formatDateDE = (date) => {
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  useEffect(() => {
    if (activeCourse && auth?.currentUser) {
      const fetchGameStats = async () => {
        try {
          const courseStatsRef = doc(firestore, `users/${auth.currentUser.uid}/game_stats/`, activeCourse.id);
          const courseStatsSnap = await getDoc(courseStatsRef);

          if (courseStatsSnap.exists()) {
            setGameStats(courseStatsSnap.data());
          } else {
            setGameStats(null);
          }
        } catch (error) {
          console.error("Error fetching game stats: ", error);
        }
      };

      fetchGameStats();
    }
  }, [activeCourse, auth?.currentUser, firestore, setGameStats]);

  const processGameStats = (mode) => {
    if (!gameStats || !gameStats[mode]) return { chartData: [], avgScore: 0, highestScore: 0 };

    const games = Object.values(gameStats[mode]);
    const sortedGames = games.toSorted((a, b) => a.end_time - b.end_time).slice(0, 20);

    const chartData = sortedGames.map((game) => ({
      gameDate: game.end_time.toDate(),
      score: game.score,
      time: Math.round(game.time / 1000),
      outcome: game.outcome
    }));

    const avgScore = games.reduce((sum, game) => sum + game.score, 0) / games.length;
    const highestScore = Math.max(...games.map(game => game.score));

    let outcomeData = [];

    if (mode === "competition") {
      const outcomeCount = sortedGames.reduce((acc, game) => {
        acc[game.outcome] = (acc[game.outcome] || 0) + 1;
        return acc;
      }, {});

      outcomeData = [
        { id: 0, value: outcomeCount.winner || 0, label: 'gewonnen' },
        { id: 1, value: outcomeCount.draw || 0, label: 'unentschieden' },
        { id: 2, value: outcomeCount.loser || 0, label: 'verloren' },
      ];
      console.log("outcomeData", outcomeData);
    }

    return { chartData, avgScore, highestScore, outcomeData };
  };

  const renderGameModeStats = (mode) => {
    const { chartData, avgScore, highestScore, outcomeData } = processGameStats(mode);
    console.log("Mode:", mode);
    console.log("chartData:", chartData);

    return (
      <Card sx={{ marginBottom: 2 }}>
        <CardContent>
          <Typography variant="h6" className='iuHeadline1' gutterBottom sx={{ my: 1 }}>{mode.toUpperCase()}-MODUS</Typography>
          {!chartData || chartData.length == 0 ? <Grid><Typography> Noch keine Daten zur Anzeige. </Typography></Grid> : <>
            <Grid container size={{ xs: 12 }}>
              <Grid container size={{ xs: 12 }}>
                <Grid size={{ xs: 4, md: 3, lg: 2 }}><Typography>Punkte-Ø:</Typography></Grid>
                <Grid><Typography sx={{ fontWeight: "bold" }}> {avgScore.toFixed(2)}</Typography></Grid>
              </Grid>
              <Grid container size={{ xs: 12 }}>
                <Grid size={{ xs: 4, md: 3, lg: 2 }}><Typography>Highscore: </Typography></Grid>
                <Grid><Typography sx={{ fontWeight: "bold" }}>{highestScore}</Typography></Grid>
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
                <Typography>
                  {chartData.length == 1 ? `Letztes Spiel:` : `Übersicht der letzten ${chartData.length} Spiele:`}
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={2} size={{ xs: 12 }} marginTop={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid textAlign={"center"}>
                  <Typography sx={{ fontWeight: "bold" }}>Punktestände</Typography>
                  <BarChart
                    xAxis={[{
                      scaleType: 'band',
                      dataKey: 'gameDate',
                      valueFormatter: (date, context) => context.location === 'tick'
                        ? ``
                        : `${formatDateDE(date)}`,
                    }]}
                    yAxis={[{
                      colorMap: {
                        type: 'continuous',
                        min: 0,
                        max: 10,
                        color: ['#b71c1c', '#d4e157'],
                      },
                      min: 0,
                      max: 10,
                      valueFormatter: (gamescore, context) => context.location === 'tick'
                        ? gamescore
                        : `${gamescore} Punkte`,
                    }]}
                    series={[{
                      dataKey: 'score',
                      label: 'Punkte',
                      valueFormatter: (v, { dataIndex }) => {
                        if (!chartData) { return `${v}`; }
                        if (!chartData[dataIndex]) { return `${v}`; }
                        const { outcome } = chartData[dataIndex];
                        if (!outcome) {
                          return `${v}`;
                        } else if (outcome == 'won') {
                          return `${v} (gewonnen)`;
                        } else if (outcome == 'draw') {
                          return `${v} (unentschieden)`;
                        } else if (outcome == 'lost') {
                          return `${v} (verloren)`;
                        } else {
                          return `${v}`;
                        }
                      },
                    }]}
                    slotProps={{ legend: { hidden: true } }}
                    dataset={chartData}
                    width={300}
                    height={300}
                    borderRadius={8} />
                </Grid>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} textAlign={"center"}>
                <Typography sx={{ fontWeight: "bold" }}>Zeit</Typography>
                <BarChart
                  xAxis={[{
                    scaleType: 'band',
                    dataKey: 'gameDate',
                    valueFormatter: (date, context) => context.location === 'tick'
                      ? ""
                      : `${formatDateDE(date)}`,
                  }]}
                  yAxis={[{
                    scaleType: 'sqrt',
                    colorMap: {
                      type: 'continuous',
                      color: ['#d4e157', '#b71c1c'],
                    },
                    valueFormatter: (seconds, context) => context.location === 'tick'
                      ? seconds
                      : `${seconds} Sekunden`,
                  }]}
                  series={[{ dataKey: 'time', label: 'Sekunden' }]}
                  slotProps={{ legend: { hidden: true } }}
                  dataset={chartData}
                  width={300}
                  height={300}
                  borderRadius={8} />
              </Grid>
            </Grid>
            {mode == "competition" && (
                <Grid size={{ xs: 12 }} textAlign={"center"} alignContent={"center"}>
                  <Grid textAlign={"center"} alignContent={"center"}>
                  <Typography sx={{ fontWeight: "bold" }}>Spielausgänge</Typography>
                  <PieChart
                    series={[{ data: outcomeData }]}
                    colors={['#d4e157', 'blue', '#b71c1c']}
                    width={500}
                    height={200}
                  />
                  </Grid>
                </Grid>
              )}
          </>}
        </CardContent>
      </Card>
    );
  };

  function handleChangeCourse(courseId) {
    updateActiveCourse(courseId);
  }

  return (
    <Grid container spacing={2} marginTop={2} size={{ xs: 12 }}>
      <Grid size={{ xs: 12, sm: 4, md: 3, lg: 3 }}>
        <ActiveCourseDisplay
          activeCourse={activeCourse}
          loading={loading}
          handleChangeCourse={handleChangeCourse}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 8, md: 9, lg: 9  }}>
        {gameStats && (
          <>
            {renderGameModeStats('single')}
            {renderGameModeStats('coop')}
            {renderGameModeStats('competition')}
          </>
        )}
        {!gameStats && (<Grid><Typography variant="h6" className='normHeadline' gutterBottom sx={{ my: 2, mx: 2 }}> Noch keine Daten zur Anzeige in diesem Kurs. </Typography></Grid>)}
      </Grid>
    </Grid>
  );
}