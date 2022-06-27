import React from "react";
import Die from "./Die";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";
import { Button } from "@mui/material";
import { Box } from "@mui/material";
import { useElapsedTime } from "use-elapsed-time";
import "./style.css";

export default function App() {
  const [dice, setDice] = React.useState(allNewDice());
  const [tenzies, setTenzies] = React.useState(false);
  const [countRolls, setCountRolls] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const { elapsedTime, reset } = useElapsedTime({ isPlaying });

  const [highScoreRoll, setHighScoreRoll] = React.useState(Infinity);
  const [highScoreTime, setHighScoreTime] = React.useState(Infinity);

  React.useEffect(() => {
    const localScoreTime = localStorage.getItem("HIGH_SCORE_TIME");
    const localScoreRoll = localStorage.getItem("HIGH_SCORE_ROLL");
    if (localScoreTime) setHighScoreTime(localScoreTime);
    if (localScoreRoll) setHighScoreRoll(localScoreRoll);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("HIGH_SCORE_TIME", highScoreTime);
    localStorage.setItem("HIGH_SCORE_ROLL", highScoreRoll);
  });

  React.useEffect(() => {
    const allHeld = dice.every((die) => die.isHeld);
    const firstValue = dice[0].value;
    const allSameValue = dice.every((die) => die.value === firstValue);

    if (allHeld && allSameValue) {
      setTenzies(true);
      setIsPlaying(false);

      setHighScoreRoll((prevHighScore) => {
        if (prevHighScore < countRolls) return prevHighScore;
        else return countRolls;
      });

      setHighScoreTime((prevHighScore) => {
        if (prevHighScore < elapsedTime) return prevHighScore;
        else return elapsedTime;
      });
    }
  }, [dice]);

  //generates random dice rolls from 1-6
  function generateNewDie() {
    return {
      value: Math.ceil(Math.random() * 6),
      isHeld: false,
      id: nanoid()
    };
  }
  //creates 10 new random rolls
  function allNewDice() {
    const newDice = [];
    for (let i = 0; i < 10; i++) {
      newDice.push(generateNewDie());
    }
    return newDice;
  }
  //function that rolls the dice and checks for winning state
  function rollDice() {
    setCountRolls(() => countRolls + 1);
    setIsPlaying(true);
    if (!tenzies) {
      setDice((oldDice) =>
        oldDice.map((die) => {
          return die.isHeld ? die : generateNewDie();
        })
      );
    } else {
      setTenzies(false);
      setDice(allNewDice());
    }
  }
  function resetGame() {
    setDice(allNewDice());
    setCountRolls(0);
    setTenzies(false);
    reset(0);
  }
  //freezes the die and prevents it from changing
  function holdDice(id) {
    setDice((oldDice) =>
      oldDice.map((die) => {
        return die.id === id ? { ...die, isHeld: !die.isHeld } : die;
      })
    );
  }

  const diceElements = dice.map((die) => (
    <Die
      key={die.id}
      value={die.value}
      isHeld={die.isHeld}
      holdDice={() => holdDice(die.id)}
    />
  ));

  return (
    <main>
      {tenzies && <Confetti />}
      <h1 className="title">Tenzies</h1>
      <h2 className="highscore-time">
        Fastest Time: {Number(highScoreTime).toFixed(3)} seconds
      </h2>
      <h2 className="highscore-roll">Lowest Rolls: {highScoreRoll} rolls</h2>
      <p className="instructions">
        Roll until all dice are the same. Click die to hold its value from being
        rerolled{" "}
      </p>
      <div className="dice-container">{diceElements}</div>
      <Box textAlign="center">
        {tenzies ? (
          <Button variant="contained" onClick={resetGame}>
            New Game
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={rollDice}>
            Roll
          </Button>
        )}
      </Box>
      <div className="counts">{countRolls} rolls</div>
      <div className="elapsed">{elapsedTime.toFixed(2)} seconds</div>
    </main>
  );
}
