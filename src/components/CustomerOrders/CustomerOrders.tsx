import React, { useState, useEffect } from 'react';
import { Tabs, Typography, Image, Row, Col, Space } from 'antd';
import Link from 'next/link'
import { useRouter } from 'next/router';
import type { TabsProps } from 'antd';
import ButtonClientPrimary from '@/components/Button/ButtonClientPrimary';
import styles from './CustomerOrders.module.css'
import { getListOrder, getListOrderBff } from '@/api/customer-order';
import { FormatMoney, OrderProps, formatOrdersDataXML } from '@/utils';
import Loading from '@/components/Loading';
import { checkLogin } from '@/utils/check';
import { ImageEmpty } from '@/constants/image';

export interface CustomerOrdersProps {
}

const { Title, Text } = Typography;

function OrderItem(props: OrderProps) {
  const router = useRouter()
  return (
    <div className='px-2 pb-4 pt-1 border-t-8 border-[#F1F1F1]'>
      <Link href={`/manage-orders/${props.orderCode}`}>
        <div className='flex justify-between items-center'>
          <Text strong className='text-xl pr-4'>
            Đơn #{props.orderCode}
          </Text>
          <Text strong className='text-red-600'>
            {props.statusShips.length > 0 ? props.statusShips[props.statusShips.length - 1].status : null}
          </Text>
          <ButtonClientPrimary name='Mua lại' onClick={() => {
            router.push('/cart');
          }} />
        </div>
        {props.listGoods.map((item, index) => {
          return (
            <div key={index}>
              <hr className='my-1 font-bold' />
              <div className="flex">
                <Image width={100} height={120} preview={false} className='rounded-xl' src={item.image || ImageEmpty} alt={item.name} />
                <div className='flex-1 pl-4'>
                  <Row className='flex-1'>
                    <Col span={19}>
                      <Text>
                        {item.name}
                      </Text>
                      <div className='mt-2'>
                        <Space>
                          <Text className='text-[#A9A9A9] flex w-28'>Màu sắc:</Text>
                          <Text className='w-16'>{item.goodsColor}</Text>
                        </Space>
                      </div>
                      <div className='mt-2'>
                        <Space>
                          <Text className='text-[#A9A9A9] flex w-28'>Size:</Text>
                          <Text className=' w-16'>{item.goodsSize}</Text>
                        </Space>
                      </div>
                      <div className='mt-2'>
                        <Space>
                          <Text className='text-[#A9A9A9] flex w-28'>Số lượng:</Text>
                          <Text className=' w-16'>{item.quantity}</Text>
                        </Space>
                      </div>
                    </Col>
                    <Col span={5}>
                      <div className='flex justify-between items-center mt-8'>
                        {item.discount === 0 ?
                          <Text strong className="text-lg">{item.unitPrice} đ</Text> :
                          <div className='flex flex-col leading-none'>
                            <Text strong className="text-lg text-red-600 leading-none">
                              {FormatMoney(item.price)}
                            </Text>
                            <div>
                              <Text strong className="text-xs line-through text-gray-400 pr-1 leading-none">
                                {FormatMoney(item.unitPrice)}
                              </Text>
                              <Text strong className="text-xs leading-none">{item.discount}%</Text>
                            </div>
                          </div>
                        }
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>
          )
        })}
      </Link>
    </div>
  )
}

export default function CustomerOrders(props: CustomerOrdersProps) {
  const [data, setData] = useState<OrderProps[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const onChangeTabs = (key: string) => {
    console.log(key);
  };
  const [received, setReceived] = useState(
    <div>
      Chưa có đơn hàng nào đã được nhận
    </div>
  )
  const [nonReceived, setNonReceived] = useState(
    <div>
      Chưa có đơn hàng nào chưa nhận
    </div>
  )
  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'CHƯA NHẬN HÀNG',
      children: nonReceived,
    },
    {
      key: '2',
      label: 'ĐÃ NHẬN HÀNG',
      children: received,
    },
  ]

  const fetchData = async () => {
    await getListOrderBff(localStorage.getItem('userId') || '')
      .then((res) => {
        if (res?.StatusCode === '200') {
          console.log(res?.Data);
          const tempData = formatOrdersDataXML(res?.Data);
          console.log(tempData);
          setData(tempData);

          const nonCompleted: OrderProps[] = tempData.filter((item: OrderProps) => {
            return item.isCompleted === false
          })
          const completed: OrderProps[] = tempData.filter((item: OrderProps) => {
            return item.isCompleted === true
          })
          setNonReceived(
            <div>
              {nonCompleted.map((item, index) => {
                return (
                  <OrderItem key={index} {...item} />
                )
              })}
            </div>
          )
          setReceived(
            <div>
              {completed.map((item, index) => {
                return (
                  <OrderItem key={index} {...item} />
                )
              })}
            </div>
          )
          setLoading(false)
        }
      })
  }

  useEffect(() => {
    checkLogin(router)
    fetchData();
  }, [])

  return (
    loading ? <Loading /> :
      <div className={styles.customerOrders}>
        <Tabs defaultActiveKey="1" items={tabItems} onChange={onChangeTabs} />
      </div>
  );
}
