import { useParams } from 'react-router-dom';

import GameLobby from './GameLobby';
import CoopGamePlay from './CoopGamePlay';

export default function CoopRoute() {
  const { gameId } = useParams();

  return (
    <>
        <CoopGamePlay gameId={gameId} />
        <GameLobby gameType="coop" gameId={gameId} />
    </>
  );
}