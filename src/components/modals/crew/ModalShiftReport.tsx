/* eslint-disable react/no-unstable-nested-components */
import { Modal, Table, type TableColumnsType } from 'antd';
import { ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import { useAppSelector } from '@/utilities/hooks';
import { useTranslation } from 'react-i18next';
import { ModalContext } from '@/components/Context';
import dayjs from 'dayjs';

interface ShiftReportTypeOne {
  key: React.Key;
  username: string,
  mileageAfterMaintenance: number,
  refueling?: number;
}

interface ShiftReportTypeTwo extends Omit<ShiftReportTypeOne, 'username' | 'mileageAfterMaintenance'> {
  date: string;
  mileage: number;
  remainingFuel: number;
  car: string;
}

const ModalShiftReport = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'modals.shiftReport' });

  const { completedShifts } = useAppSelector((state) => state.crew);

  const { modalClose } = useContext(ModalContext);

  const initialArray: [ShiftReportTypeTwo[], ShiftReportTypeOne[]] = [[], []];

  const [data, nestedData] = completedShifts.reduce<[ShiftReportTypeTwo[], ShiftReportTypeOne[]]>((acc, {
    id: key, date, car, user, mileage, mileageAfterMaintenance, remainingFuel, refueling,
  }) => {
    acc[0].push({
      key, date: dayjs(date).format('DD.MM'), car: car?.call as string, mileage, remainingFuel,
    });
    acc[1].push({
      key, username: user?.username as string, mileageAfterMaintenance, refueling,
    });
    return acc;
  }, initialArray);

  const columns: TableColumnsType<ShiftReportTypeTwo> = [
    {
      title: t('date'),
      className: 'text-center',
      dataIndex: 'date',
      ellipsis: true,
    },
    {
      title: t('car'),
      className: 'text-center',
      dataIndex: 'car',
      ellipsis: true,
    },
    {
      title: t('mileage'),
      className: 'text-center',
      dataIndex: 'mileage',
      render: (value) => <span className="background-filling">{value}</span>,
      ellipsis: true,
    },
    {
      title: t('remainingFuel'),
      className: 'text-center',
      dataIndex: 'remainingFuel',
      render: (value) => <span className="background-filling">{value}</span>,
      ellipsis: true,
    },
  ];

  const expandedRowRender = ({ key }: { key: React.Key }) => {
    const nestedColumns: TableColumnsType<ShiftReportTypeOne> = [
      {
        title: t('completed'),
        className: 'text-center',
        dataIndex: 'username',
        ellipsis: true,
      },
      {
        title: t('mileageAfterMaintenance'),
        className: 'text-center',
        dataIndex: 'mileageAfterMaintenance',
        ellipsis: true,
      },
      {
        title: t('refueling'),
        className: 'text-center',
        dataIndex: 'refueling',
        ellipsis: true,
      },
    ];

    return <Table columns={nestedColumns} dataSource={nestedData.filter((nest) => nest.key === key)} pagination={false} size="small" bordered />;
  };

  return (
    <Modal
      centered
      open
      footer={null}
      styles={{
        content: {
          paddingLeft: '0.25em', paddingRight: '0.25em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-4">
        <div className="h1">{t('title')}</div>
        <Table
          columns={columns}
          dataSource={data.sort((a, b) => (b.key as number) - (a.key as number))}
          locale={{
            emptyText: (
              <div className="ant-empty ant-empty-normal my-4">
                <div className="ant-empty-image">
                  <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(0 1)" fill="none" fillRule="evenodd">
                      <ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7" />
                      <g fillRule="nonzero" stroke="#d9d9d9">
                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
                        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#fafafa" />
                      </g>
                    </g>
                  </svg>
                </div>
                <div className="ant-empty-description mt-2">{t('emptyText')}</div>
              </div>
            ),
          }}
          expandable={{
            expandedRowRender,
            defaultExpandedRowKeys: [data[0]?.key],
            expandIcon: ({ expanded, onExpand, record }) => (expanded ? (
              <ZoomOutOutlined
                className="fs-5 animate__animated animate__flipInY"
                onClick={(e) => onExpand(record, e)}
              />
            ) : (
              <ZoomInOutlined
                className="fs-5 animate__animated animate__flipInY"
                onClick={(e) => onExpand(record, e)}
              />
            )),
          }}
          size="small"
          bordered
          pagination={false}
          scroll={{ y: '60vh' }}
        />
      </div>
    </Modal>
  );
};

export default ModalShiftReport;
