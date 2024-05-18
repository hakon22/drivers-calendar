/* eslint-disable react/jsx-props-no-spreading */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppSelector } from '@/utilities/hooks';
import cn from 'classnames';
import { UserModel } from '../../server/db/tables/Users';

const SortableItem = ({ user, index, activeId }: { user: UserModel, index: number, activeId: number }) => {
  const { id: myId } = useAppSelector((state) => state.user);
  const { id, username } = user;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  let boxShadow = '';

  if (transform && activeId === id) {
    transform.scaleY = 1.1;
    transform.scaleX = 1.05;
    boxShadow = '0px 6px 5px rgba(0, 0, 0, 0.24), 0px 9px 18px rgba(0, 0, 0, 0.18)';
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow,
  };

  const className = cn(
    'd-flex justify-content-center align-items-center position-relative sortable-item',
    { 'text-danger': id === myId },
  );

  return (
    <li ref={setNodeRef} className={className} style={style} {...attributes} {...listeners}>
      <span>{index}</span>
      <span>{username}</span>
    </li>
  );
};

export default SortableItem;
