import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ActionButton } from '../src/components/ActionButton';
import { colors, createThemedStyles, useThemeRevision } from '../src/theme';

export default function ErrorScreen(){useThemeRevision();const router=useRouter();return <View style={styles.center}><Text style={styles.icon}>!</Text><Text style={styles.title}>Unable to load data</Text><Text style={styles.copy}>Check your connection and try again.</Text><ActionButton title="Retry" onPress={()=>router.replace('/(tabs)')}/></View>}
const styles=createThemedStyles((theme) => ({center:{flex:1,backgroundColor:theme.background,alignItems:'center',justifyContent:'center',padding:24},icon:{fontSize:36,color:theme.error,borderColor:theme.error,borderWidth:2,width:66,height:66,textAlign:'center',textAlignVertical:'center',borderRadius:40},title:{fontSize:21,fontWeight:'800',color:theme.textPrimary,marginTop:16},copy:{fontSize:12,color:theme.textSecondary,marginTop:7,marginBottom:15}}));
