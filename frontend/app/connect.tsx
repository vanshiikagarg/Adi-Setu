import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ActionButton } from '../src/components/ActionButton';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { api } from '../src/services/api';
import { colors, createThemedStyles } from '../src/theme';
import { useApp } from '../src/context/AppContext';

const options=[
  {key:'stCertificate',title:'ST Caste Certificate',detail:'Required for the sample ST verification flow.'},
  {key:'identity',title:'Identity Document',detail:'Optional sample document.'},
  {key:'incomeCertificate',title:'Income Certificate',detail:'Optional sample document.'},
  {key:'academicCertificate',title:'Academic Certificate',detail:'Optional sample document.'},
];

export default function ConnectScreen() {
  const [busy,setBusy]=useState(false);
  const [selected,setSelected]=useState<string[]>([]);
  const [sampleName,setSampleName]=useState('Asha');
  const router=useRouter();
  const {reload}=useApp();
  function toggle(key:string){setSelected(current=>current.includes(key)?current.filter(item=>item!==key):[...current,key]);}
  async function continuePrototype(){
    setBusy(true);
    try {
      await api.post('/digilocker/demo-connect',{documents:selected,name:sampleName});
      await reload();
      router.replace({pathname:'/success',params:{type:'prototype-connect'}});
    } catch(error) {
      Alert.alert('Prototype consent',error instanceof Error?error.message:'Could not continue.');
    } finally { setBusy(false); }
  }
  return <Page>
    <Heading eyebrow="MOBILE APP PROTOTYPE" title="DigiLocker Consent" icon={<Image source={require('../src/images/digilocker.png')} resizeMode="contain" style={styles.digilockerIcon}/>} subtitle="Review the requested document choices and consent for this sample flow."/>
   
    <Card><Text style={styles.cardTitle}>Select documents</Text>{options.map(item=><Pressable accessibilityRole="checkbox" accessibilityLabel={`Select ${item.title}`} accessibilityState={{checked:selected.includes(item.key)}} onPress={()=>toggle(item.key)} style={styles.option} key={item.key}><View style={[styles.checkbox,selected.includes(item.key)&&styles.checked]}>{selected.includes(item.key)&&<Icon name="checkmark" size={15} color={colors.textPrimary}/>}</View><View style={{flex:1}}><Text style={styles.optionTitle}>{item.title}{item.key==='stCertificate'?' · Required':''}</Text><Text style={styles.copy}>{item.detail}</Text></View></Pressable>)}</Card>
    <Card style={styles.demoCard}><View style={styles.demoRow}><Icon name="information-circle-outline" color={colors.primary}/><Text style={styles.copy}><Text style={styles.demoText}>Prototype only. </Text>This does not open DigiLocker, verify ST status, or access real documents. It stores sample choices on this device for the demo.</Text></View></Card>
    <ActionButton title="Continue in prototype" icon={<Icon name="shield-checkmark-outline" color={colors.textPrimary}/>} loading={busy} disabled={!selected.includes('stCertificate')} onPress={()=>void continuePrototype()}/>
    {!selected.includes('stCertificate')&&<Text style={styles.helper}>Select the ST Caste Certificate checkbox to continue.</Text>}
    <ActionButton title="Continue without connecting" secondary onPress={()=>router.replace('/(tabs)')}/>
  </Page>;
}
const styles=createThemedStyles((theme) => ({hero:{height:92,borderRadius:14,backgroundColor:theme.surfaceStrong,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:14,marginBottom:14},digilockerIcon:{width:42,height:42,borderRadius:6,tintColor:'#FFFFFF'},cardTitle:{fontSize:14,fontWeight:'800',color:theme.textPrimary},copy:{fontSize:12,color:theme.textMuted,lineHeight:18,marginTop:5},nameInput:{height:46,borderWidth:1,borderColor:theme.border,borderRadius:10,paddingHorizontal:12,marginTop:10,color:theme.textSecondary,backgroundColor:theme.input,fontSize:13},option:{flexDirection:'row',alignItems:'flex-start',gap:11,paddingVertical:13,borderBottomWidth:1,borderBottomColor:theme.border},checkbox:{width:22,height:22,borderWidth:1.5,borderColor:theme.border,borderRadius:6,alignItems:'center',justifyContent:'center',marginTop:1},checked:{backgroundColor:theme.primary,borderColor:theme.primary},optionTitle:{fontSize:12,fontWeight:'700',color:theme.textSecondary},helper:{fontSize:11,color:theme.textMuted,textAlign:'center',marginTop:8},demoCard:{backgroundColor:theme.surfaceStrong},demoRow:{flexDirection:'row',alignItems:'flex-start',gap:9},demoText:{fontWeight:'800',color:theme.textPrimary}}));
