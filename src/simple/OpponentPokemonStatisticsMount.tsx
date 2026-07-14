import { useEffect, useState } from "react";
import { OpponentPokemonStatistics } from "./OpponentPokemonStatistics";
import { APP_STATE_CHANGED_EVENT, APP_STATE_STORAGE_KEY } from "./storage";

export function OpponentPokemonStatisticsMount() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => {
      if (document.querySelector(".history-layout")) {
        setVersion((current) => current + 1);
      }
    };
    const refreshFromStorage = (event: StorageEvent) => {
      if (event.key === APP_STATE_STORAGE_KEY) refresh();
    };

    window.addEventListener(APP_STATE_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refreshFromStorage);
    return () => {
      window.removeEventListener(APP_STATE_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  return <OpponentPokemonStatistics key={version} />;
}
