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
          paddingLeft: '0.5em', paddingRight: '0.5em', maxHeight: '90vh', overflow: 'auto',
        },
      }}
      onCancel={modalClose}
    >
      <div className="my-4 d-flex flex-column align-items-center gap-4">
        <div className="h1">{t('title')}</div>
        <Table
          columns={columns}
          dataSource={data.sort((a, b) => (b.key as number) - (a.key as number))}
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
