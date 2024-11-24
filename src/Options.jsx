function Options({ question, dispatch, answer }) {
  const hasAnswer = answer !== null;

  return (
    <div className="options">
      {question.options.map((el, i) => (
        <button
          className={`btn btn-option ${hasAnswer ? (i === answer ? 'answer' : '') : ''} ${
            hasAnswer ? (i === question.correctOption ? 'correct' : 'wrong') : ''
          }`}
          key={`q-${i}`}
          onClick={() => dispatch({ type: 'newAnswer', payload: i })}
          disabled={hasAnswer}
        >
          {el}
        </button>
      ))}
    </div>
  );
}

export default Options;
