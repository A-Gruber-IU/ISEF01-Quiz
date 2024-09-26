import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';
import CompetitionGame from './CompetitionGame';

export default function CompetitionRoute() {
  const { gameId } = useParams();

  return (
    <>
        <CompetitionGame gameId={gameId} />
        <GameLobby gameType={"competition"} gameId={gameId} />
    </>
  );
}