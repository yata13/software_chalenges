import Icon from './Icon.jsx';
import Pic from '../diagrams/Pics.jsx';

// Quiz answer card. state: default | correct | wrong | dim (disabled)
export default function Answer({ k, option, state = 'default', disabled, onPick }) {
  const cls = state === 'default' ? '' : ` ${state}`;
  const isPic = typeof option === 'object';
  return (
    <button type="button" className={`answer${cls}`} disabled={disabled} onClick={onPick}
      aria-pressed={state === 'correct' || state === 'wrong'}>
      <span className="key">{k}</span>
      {isPic ? <Pic name={option.pic} alt={option.alt} /> : <span className="txt">{option}</span>}
      {state === 'correct' && <span className="badge"><Icon name="check" size={15} stroke={3} label="Correct" /></span>}
      {state === 'wrong' && <span className="badge"><Icon name="close" size={13} stroke={3} label="Wrong" /></span>}
    </button>
  );
}

export const KEYS = ['A', 'B', 'C', 'D', 'E'];

export function answerState(i, picked, right) {
  if (picked == null) return 'default';
  if (i === right) return 'correct';
  if (i === picked) return 'wrong';
  return 'dim';
}
