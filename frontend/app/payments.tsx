import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { Heading, Page } from '../src/components/Page';
import { Icon } from '../src/components/Icon';
import { useApp } from '../src/context/AppContext';
import { colors, createThemedStyles } from '../src/theme';

export default function PaymentsScreen(){const {data}=useApp();const router=useRouter();const records=data?.applications.filter(application=>application.paymentStatus)||[];
return <Page><Heading eyebrow="CONSOLIDATED PAYMENT VIEW" title="Payment & DBT" subtitle="Payment details are shown only when a connected source or configured application record provides them."/>
  {records.map(application=><Card key={application.id}><View style={styles.row}><View style={styles.tile}><Icon name="landmark" color={colors.accent}/></View><View style={{flex:1}}><Text style={styles.title}>{application.name}</Text><Text style={styles.meta}>Application: {application.status}</Text></View><Text style={styles.status}>{application.paymentStatus}</Text></View>
    {application.dbtStatus?<Info label="DBT status" value={application.dbtStatus}/>:null}{typeof application.paymentAmount==='number'?<Info label="Configured amount" value={String(application.paymentAmount)}/>:null}{application.sanctionStatus?<Info label="Sanction status" value={application.sanctionStatus}/>:null}{application.lastPaymentUpdate?<Info label="Last updated" value={application.lastPaymentUpdate}/>:null}
    {application.status.toLowerCase().includes('prototype')?<Text style={styles.disclaimer}>Demo Data · This is a local prototype record, not a live DBT status.</Text>:null}
  </Card>)}
  {!records.length?<Card><View style={styles.empty}><Icon name="landmark" size={29} color={colors.accent}/><Text style={styles.title}>No payment status available</Text><Text style={styles.meta}>No DBT or payment source is connected, and there are no configured payment records. Amounts, transaction details, and dates are not available.</Text></View></Card>:null}
  <Card><View style={styles.row}><Icon name="information-circle-outline" color={colors.accent}/><Text style={styles.meta}>The DBT integration is proposed for this prototype. Do not treat a missing status as a payment result.</Text></View></Card>
  <Pressable onPress={()=>router.push('/applications')} style={styles.link}><Text style={styles.linkText}>View application tracking</Text><Icon name="chevron-forward" size={17}/></Pressable>
</Page>}
function Info({label,value}:{label:string;value:string}){return <View style={styles.info}><Text style={styles.meta}>{label}</Text><Text style={styles.value}>{value}</Text></View>}
const styles=createThemedStyles((theme) => ({row:{flexDirection:'row',alignItems:'center',gap:10},tile:{width:40,height:40,borderRadius:12,backgroundColor:theme.surfaceStrong,alignItems:'center',justifyContent:'center'},title:{fontSize:13,fontWeight:'800',color:theme.textPrimary,marginTop:7},meta:{fontSize:11,lineHeight:17,color:theme.textMuted,flex:1},status:{fontSize:11,fontWeight:'700',color:theme.accent},info:{paddingVertical:9,borderBottomWidth:1,borderColor:theme.border},value:{fontSize:12,color:theme.textSecondary,fontWeight:'600',marginTop:4},disclaimer:{fontSize:10,color:theme.warning,marginTop:10},empty:{alignItems:'center',paddingVertical:8},link:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,paddingVertical:12},linkText:{fontSize:12,color:theme.accent,fontWeight:'700'}}));
