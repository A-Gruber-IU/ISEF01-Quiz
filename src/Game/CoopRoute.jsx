import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';
import CoopGame from './CoopGame';

export default function CoopRoute() {
  const { gameId } = useParams();

  return (
    <>
        <CoopGame gameId={gameId} />
        <GameLobby gameType="coop" gameId={gameId} />
    </>
  );
}