import { defineStore } from 'pinia';
import type { permissionDictionary } from '@/types/permissionDictionary';

export const useDictionaryStore = defineStore('dictionary', () => {
  // 初始化字典
  // const dictionariesByGroup = ref<Record<string,Dictionary[]>>({})
  const dictionariesByGroup = reactive(new Map<string, permissionDictionary[]>());

  // 设置数据字典
  const setDictionaries = (group: string, dictionaries: permissionDictionary[]) => {
    // 使用reduce方法将数据字典按组别分类
    // dictionariesByGroup.value = dictionaries.reduce((acc, dictionary) => {
    //   if (!acc[group]) {
    //     acc[group] = []
    //   }
    //   acc[group].push(dictionary)
    //   return acc
    // }, dictionariesByGroup.value)
    dictionariesByGroup.set(group, dictionaries);
  };

  // 加载数组字典
  const getDictionaries = (code: string) => {
    return dictionariesByGroup.get(code) || [];
  };

  // 获取对应数据字典组
  const getDictionaryGroup = (id: number, group: string) => {
    const groupDict = dictionariesByGroup.get(group);
    if (!groupDict) return '';

    const entry = groupDict.find((item: any) => item.id === id);
    return entry ? entry.sys_name : '';
  };

  // 根据IDu获取数据字典的名称
  const getDictionaryName = (id: number, group: string): string => {
    const groupDict = dictionariesByGroup.get(group);
    if (!groupDict) return '';

    const entry = groupDict.find((item: any) => item.id === id);
    return entry ? entry.name : '';
  };

  return {
    dictionariesByGroup,
    setDictionaries,
    getDictionaries,
    getDictionaryName,
    getDictionaryGroup
  };
});
