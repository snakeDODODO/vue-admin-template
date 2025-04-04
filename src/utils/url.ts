// 获取头像完整URL的方法
export const getAvatarUrl = (avatar: string) => {
  if (!avatar) return '';
  // 如果已经是完整URL（包含http或https），则直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  // 否则拼接前缀
  return import.meta.env.VITE_AVATAR_URL + avatar;
};
