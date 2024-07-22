/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import SocketEventEnum from '../types/notification/enum/SocketEventEnum';

class SocketEvents {
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

  constructor(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    this.io = io;
  }

  public socketMakeSchedule = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.MAKE_SCHEDULE, data);
  };

  public socketSendNotification = (data: any) => {
    if (data?.sendAll) {
      this.io.emit(SocketEventEnum.SEND_NOTIFICATION, data);
    } else {
      this.io.sockets.in(`USER:${data?.userId}`).emit(SocketEventEnum.SEND_NOTIFICATION, data);
    }
  };

  public socketActiveCarUpdate = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.ACTIVE_CAR_UPDATE, data);
  };

  public socketCarUpdate = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.CAR_UPDATE, data);
  };

  public socketCarRemove = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.CAR_REMOVE, data);
  };

  public socketCarAdd = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.CAR_ADD, data);
  };

  public socketSwipShift = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.SWIP_SHIFT, data);
  };

  public socketSendMessageToChat = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.SEND_MESSAGE_TO_CHAT, data);
  };

  public socketChangeIsRoundFuel = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.CHANGE_IS_ROUND_FUEL, data);
  };

  public socketChangeFuelSeason = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.CHANGE_FUEL_SEASON, data);
  };

  public socketUserProfileUpdate = ({ crewId, ...data }: any) => {
    if (crewId && data?.username) {
      this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.USER_PROFILE_UPDATE, data);
    } else {
      this.io.sockets.in(`USER:${data?.id}`).emit(SocketEventEnum.USER_PROFILE_UPDATE, data);
    }
  };
}

export default SocketEvents;
