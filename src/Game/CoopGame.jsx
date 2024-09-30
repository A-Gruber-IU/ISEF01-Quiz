import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';

export default function CoopGame() {
  const { gameId } = useParams();

  return (
    <GameLobby gameType="coop" gameId={gameId} />
  );
}