/* eslint-disable jsx-a11y/control-has-associated-label */
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';

const BackButton = ({ title, style }: { title?: string, style?: CSSProperties }) => {
  const router = useRouter();

  const back = () => router.back();

  return (<span className="back-button" style={style} onClick={back} onKeyDown={back} tabIndex={0} role="button" title={title} />);
};

BackButton.defaultProps = {
  title: '',
  style: {},
};

export default BackButton;
