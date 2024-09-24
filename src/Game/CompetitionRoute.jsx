import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';
import CompetitionGamePlay from './CompetitionGamePlay';

export default function CompetitionRoute() {
  const { gameId } = useParams();

  return (
    <>
        <CompetitionGamePlay gameId={gameId} />
        <GameLobby gameType={"competition"} gameId={gameId} />
    </>
  );
}