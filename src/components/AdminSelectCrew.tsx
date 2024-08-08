import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button, Collapse, Tag } from 'antd';
import { useContext, useEffect, useState } from 'react';
import { CollapseProps } from 'antd/lib';
import axios from 'axios';
import routes from '@/routes';
import axiosErrorHandler from '@/utilities/axiosErrorHandler';
import { fetchCrew } from '@/slices/crewSlice';
import { useAppDispatch } from '@/utilities/hooks';
import { SubmitContext } from './Context';
import { CrewModel } from '../../server/db/tables/Crews';

const AdminSelectCrew = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'index.adminSelectCrew' });
  const { t: tToast } = useTranslation('translation', { keyPrefix: 'toast' });

  const router = useRouter();
  const dispatch = useAppDispatch();

  const { setIsSubmit } = useContext(SubmitContext);

  const [crews, setCrews] = useState<CrewModel[]>([]);
  const [collapsedCrew, setCollapsedCrew] = useState<string[] | string>([]);

  const items: CollapseProps['items'] = crews.map((crew) => ({
    key: crew.id,
    label: <span className="fw-bold">{crew.name}</span>,
    style: Array.isArray(collapsedCrew) && +collapsedCrew[0] === crew.id ? { backgroundColor: 'white' } : {},
    children: (
      <>
        <div className="mb-1 fst-italic">{t('drivers')}</div>
        <ul>{(crew.users ?? []).map((user) => <li key={user.id}><Tag color="geekblue">{user.username}</Tag></li>)}</ul>
        <div className="mb-1 fst-italic">{t('cars')}</div>
        <ul>
          {(crew.cars ?? []).map(({
            id, brand, model, call, inventory,
          }) => (
            <li key={id}>
              <Tag color={crew.activeCar === id ? 'green' : 'volcano'}>{`${brand} ${model} (${call}/${inventory})`}</Tag>
            </li>
          ))}
        </ul>
        <div className="mt-3 d-flex justify-content-center">
          <Button
            type="primary"
            className="button-height button"
            onClick={async () => {
              setIsSubmit(true);
              await dispatch(fetchCrew(crew.id));
              router.push(`?crewId=${crew.id}`);
              setIsSubmit(false);
            }}
          >
            {t('submitButton')}
          </Button>
        </div>
      </>
    ),
  }));

  useEffect(() => {
    setIsSubmit(true);
    axios.get(routes.fetchCrewList)
      .then(({ data }) => {
        setCrews(data.crews as CrewModel[]);
        setIsSubmit(false);
      })
      .catch((e) => axiosErrorHandler(e, tToast, setIsSubmit));
  }, []);

  return (
    <div style={{ maxHeight: '80vh', width: '100%', overflow: 'auto' }}>
      <Collapse className="my-4" items={items} expandIconPosition="end" accordion onChange={setCollapsedCrew} />
    </div>
  );
};

export default AdminSelectCrew;
