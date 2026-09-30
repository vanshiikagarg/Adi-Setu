import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon, AppIconName } from '../src/components/Icon';
import { useApp } from '../src/context/AppContext';
import { useTheme } from '../src/context/ThemeContext';
import { colors, createThemedStyles } from '../src/theme';
import { saveThemePreference } from '../src/services/themePreference';

const choices: { mode:'Light'|'Dark'|'System'; title:string; description:string; icon:AppIconName }[]=[
  {mode:'Light',title:'Light',description:'Use ADI SETU’s light surfaces and existing blue styling.',icon:'sunny-outline'},
  {mode:'Dark',title:'Dark',description:'Use the deep navy and blue ADI SETU palette.',icon:'moon-outline'},
  {mode:'System',title:'System',description:'Follow the current appearance setting on your device.',icon:'settings-outline'},
];

export default function ThemeScreen(){
  const {themeMode,setThemeMode}=useTheme();const {saveSettings}=useApp();const [saving,setSaving]=useState(false);
  async function choose(mode:'Light'|'Dark'|'System'){
    if(mode===themeMode||saving)return;
    const previous=themeMode;setThemeMode(mode);setSaving(true);
    try{await saveThemePreference(mode);await saveSettings({theme:mode});}
    catch(error){setThemeMode(previous);void saveThemePreference(previous);Alert.alert('Theme',error instanceof Error?error.message:'Could not save your theme preference.');}
    finally{setSaving(false);}
  }
  return <Page><Heading title="Theme" subtitle="Choose how ADI SETU appears. Changes apply immediately and are saved for your next visit."/>
    <Card>{choices.map(choice=>{const selected=themeMode===choice.mode;return <Pressable key={choice.mode} accessibilityRole="radio" accessibilityState={{selected}} onPress={()=>void choose(choice.mode)} style={[styles.option,selected&&styles.selected]}><View style={styles.iconTile}><Icon name={choice.icon} color={selected?colors.primary:colors.textMuted} size={22}/></View><View style={styles.copy}><Text style={styles.label}>{choice.title}</Text><Text style={styles.description}>{choice.description}</Text></View><View style={[styles.radio,selected&&styles.radioSelected]}>{selected?<View style={styles.radioDot}/>:null}</View></Pressable>})}</Card>
    <Text style={styles.hint}>{saving?'Saving theme preference…':'Your preference is stored with ADI SETU settings.'}</Text>
  </Page>
}

const styles=createThemedStyles((theme) => ({option:{minHeight:76,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:8,borderBottomWidth:1,borderBottomColor:theme.border,borderRadius:12},selected:{backgroundColor:theme.surfaceStrong},iconTile:{width:40,height:40,borderRadius:12,backgroundColor:theme.surface,alignItems:'center',justifyContent:'center'},copy:{flex:1},label:{color:theme.textPrimary,fontSize:14,fontWeight:'700'},description:{color:theme.textSecondary,fontSize:11,lineHeight:16,marginTop:4},radio:{width:20,height:20,borderRadius:10,borderWidth:1.5,borderColor:theme.textMuted,alignItems:'center',justifyContent:'center'},radioSelected:{borderColor:theme.primary},radioDot:{width:10,height:10,borderRadius:6,backgroundColor:theme.primary},hint:{fontSize:10,color:theme.textMuted,textAlign:'center',marginTop:10}}));
