import { Link } from "react-router-dom";

function ChoiceButton() {
  return (
    <div>
      <button>
        <Link to="/">항공편</Link>
      </button>
      <button>
        <Link to="/hotels">호텔</Link>
      </button>
    </div>
  );
}

export default ChoiceButton;
