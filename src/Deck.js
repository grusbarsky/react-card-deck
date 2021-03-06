import React, { useEffect, useState, useRef } from "react";
import Card from "./Card";
import axios from "axios";
import "./Deck.css";

const API = "http://deckofcardsapi.com/api/deck";

function Deck() {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null);

  /* load deck */
  useEffect(() => {
    async function getData() {
      let d = await axios.get(`${API}/new/shuffle/`);
      setDeck(d.data);
    }
    getData();
  }, [setDeck]);

  /* Draw one card every second if autoDraw is true */
  useEffect(() => {
    /* draw a single card */
    async function getCard() {
      let { deck_id } = deck;

      try {
        let drawRes = await axios.get(`${API}/${deck_id}/draw/`);

        if (drawRes.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error("no cards remaining!");
        }

        const card = drawRes.data.cards[0];

        setDrawn(d => [
          ...d,
          {
            id: card.code,
            name: card.suit + " " + card.value,
            image: card.image
          }
        ]);
      } catch (err) {
        alert(err);
      }
    }

    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  const toggleAutoDraw = () => {
    setAutoDraw(auto => !auto);
  };

  const cards = drawn.map(c => (
    <Card key={c.id} name={c.name} image={c.image} />
  ));

  return (
    <div className="Deck">
      {deck ? (
        <button className="auto-draw" onClick={toggleAutoDraw}>
          {autoDraw ? "STOP" : "KEEP"} DRAWING FOR ME!
        </button>
      ) : null}
      <div className="deck">{cards}</div>
    </div>
  );
}

export default Deck;
