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
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.MAKE_SCHEDULE, data, crewId);
  };

  public socketSendNotification = (data: any) => {
    if (data?.sendAll) {
      this.io.emit(SocketEventEnum.SEND_NOTIFICATION, data);
    } else {
      this.io.sockets.in(`USER:${data?.userId}`).emit(SocketEventEnum.SEND_NOTIFICATION, data);
    }
  };

  public socketActiveCarUpdate = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.ACTIVE_CAR_UPDATE, data, crewId);
  };

  public socketCarUpdate = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CAR_UPDATE, data, crewId);
  };

  public socketCarRemove = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CAR_REMOVE, data, crewId);
  };

  public socketCarAdd = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CAR_ADD, data, crewId);
  };

  public socketSwipShift = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.SWIP_SHIFT, data, crewId);
  };

  public socketSendMessageToChat = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).emit(SocketEventEnum.SEND_MESSAGE_TO_CHAT, data);
  };

  public socketChangeIsRoundFuel = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CHANGE_IS_ROUND_FUEL, data, crewId);
  };

  public socketChangeIsWorkingWeekend = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CHANGE_IS_WORKING_WEEKEND, data, crewId);
  };

  public socketChangeFuelSeason = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.CHANGE_FUEL_SEASON, data, crewId);
  };

  public socketCompletedShift = (data: any) => {
    this.io.sockets.in(`CREW:${data.crewId}`).in('ADMIN').emit(SocketEventEnum.COMPLETED_SHIFT, data, data.crewId);
  };

  public socketKickReplacement = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.KICK_REPLACEMENT, data, crewId);
  };

  public socketKickLogout = ({ userId, ...data }: any) => {
    this.io.sockets.in(`USER:${userId}`).emit(SocketEventEnum.LOGOUT, data);
  };

  public socketAddUserInCrew = ({ crewId, ...data }: any) => {
    this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.ADD_USER_IN_CREW, data, crewId);
  };

  public socketUserProfileUpdate = ({ crewId, ...data }: any) => {
    if (crewId) {
      this.io.sockets.in(`CREW:${crewId}`).in('ADMIN').emit(SocketEventEnum.USER_PROFILE_UPDATE, data, crewId);
    }
    this.io.sockets.in(`USER:${data?.id}`).emit(SocketEventEnum.USER_PROFILE_UPDATE, data);
  };
}

export default SocketEvents;
