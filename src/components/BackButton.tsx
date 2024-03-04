/* eslint-disable jsx-a11y/control-has-associated-label */
import { useRouter } from 'next/navigation';

const BackButton = ({ title }: { title?: string }) => {
  const router = useRouter();

  const back = () => router.back();

  return (<span className="back-button" onClick={back} onKeyDown={back} tabIndex={0} role="button" title={title} />);
};

BackButton.defaultProps = {
  title: '',
};

export default BackButton;
