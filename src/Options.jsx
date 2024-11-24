function Options({ question }) {
  return (
    <div className="options">
      {question.options.map((el, i) => (
        <button className="btn btn-option" key={`q-${i}`}>
          {el}
        </button>
      ))}
    </div>
  );
}

export default Options;
