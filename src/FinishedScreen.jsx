function FinishedScreen({ points, maxPoints, highscore }) {
  const percentage = Math.ceil((points / maxPoints) * 100);
  return (
    <>
      <p className="result">{`Your score ${points} out of ${maxPoints} (${percentage}%)`}</p>
      <p className="highscore">{`(Highscore: ${highscore} points)`}</p>
    </>
  );
}

export default FinishedScreen;
