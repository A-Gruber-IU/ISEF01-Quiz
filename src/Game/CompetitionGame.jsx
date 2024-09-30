import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';

export default function CompetitionGame() {
  const { gameId } = useParams();

  return (
    <GameLobby gameType={"competition"} gameId={gameId} />
  );
}