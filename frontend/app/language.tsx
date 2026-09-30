import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '../src/components/ActionButton';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { api } from '../src/services/api';
import { useApp } from '../src/context/AppContext';
import { colors, createThemedStyles } from '../src/theme';
import { supportedLanguages, t } from '../src/i18n';

export default function LanguageScreen(){
  const {data,reload}=useApp();
  const [language,setLanguage]=useState(data?.settings.language||'English');
  const router=useRouter();
  async function apply(){
    try { await api.patch('/settings',{language}); await reload(); router.back(); }
    catch(error){Alert.alert('Language',error instanceof Error?error.message:'Could not save your language.');}
  }
  return <Page><Heading title="Language" subtitle="Choose your preferred language."/><Card>{supportedLanguages.map(label=><Pressable key={label} onPress={()=>setLanguage(label)} style={styles.option}><Text style={styles.label}>{label}</Text>{label===language?<Icon name="checkmark-circle"/>:null}</Pressable>)}</Card><ActionButton title={t(language,'Continue')} onPress={()=>void apply()}/></Page>;
}
const styles=createThemedStyles((theme) => ({option:{height:48,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderBottomWidth:1,borderColor:theme.border},label:{fontSize:13,color:theme.textSecondary}}));
