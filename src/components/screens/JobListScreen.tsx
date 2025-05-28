import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  Text,
  SafeAreaView
} from 'react-native';
import { Searchbar, IconButton } from 'react-native-paper';
import Svg, { Path } from 'react-native-svg';
import JobItem from '../ui/JobItem';
import BackgroundDecorator from '../ui/BackgroundDecorator';
import appTheme from '../../constants/theme';

// SVG компоненты для иконок
const DesignIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#182237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 17L12 22L22 17" stroke="#182237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M2 12L12 17L22 12" stroke="#182237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

const CodeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M16 18L22 12L16 6" stroke="#182237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M8 6L2 12L8 18" stroke="#182237" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

// Интерфейс для элемента услуги
interface Job {
  id: string;
  title: string;
  price: string;
  icon: React.ReactNode;
}

// Пример данных (в реальном приложении должны загружаться из API)
const JOBS_DATA: Job[] = [
  { id: '1', title: 'UI/UX Designer', price: '$7k - $8k', icon: <DesignIcon /> },
  { id: '2', title: 'Senior Designer', price: '$5k - $7k', icon: <DesignIcon /> },
  { id: '3', title: 'Lead UI Designer', price: '$10k - $13k', icon: <DesignIcon /> },
  { id: '4', title: 'Product Designer', price: '$4k - $6k', icon: <DesignIcon /> },
  { id: '5', title: 'Frontend Developer', price: '$5k - $7k', icon: <CodeIcon /> },
  { id: '6', title: 'Backend Developer', price: '$6k - $8k', icon: <CodeIcon /> },
];

// Компонент экрана списка услуг
const JobListScreen = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filteredJobs, setFilteredJobs] = useState(JOBS_DATA);
  
  // Обработчик изменения текста поиска
  const onChangeSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredJobs(JOBS_DATA);
      return;
    }
    
    // Фильтрация данных на основе запроса
    const filtered = JOBS_DATA.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredJobs(filtered);
  };
  
  // Обработчик выбора услуги
  const handleSelectJob = (id: string) => {
    setSelectedJobId(id);
    // Здесь можно сделать дополнительную логику, например переход на другой экран
    // navigation.navigate('JobDetails', { jobId: id });
  };
  
  // Рендер элемента услуги
  const renderJobItem = ({ item }: { item: Job }) => (
    <JobItem
      id={item.id}
      title={item.title}
      price={item.price}
      icon={item.icon}
      isSelected={selectedJobId === item.id}
      onPress={() => handleSelectJob(item.id)}
    />
  );
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <BackgroundDecorator variant="top-right" intensity={30} />
      <BackgroundDecorator variant="bottom-left" intensity={20} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Выберите вакансию</Text>
        </View>
        
        <Searchbar
          placeholder="Поиск вакансий..."
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={styles.searchBar}
          iconColor={appTheme.colors.textSecondary}
        />
        
        <Text style={styles.subtitle}>Доступные вакансии</Text>
        
        <FlatList
          data={filteredJobs}
          renderItem={renderJobItem}
          keyExtractor={item => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: appTheme.spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: appTheme.spacing.m,
    marginBottom: appTheme.spacing.m,
  },
  headerTitle: {
    ...appTheme.typography.screenTitle,
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // Компенсация для иконки назад
  },
  searchBar: {
    marginBottom: appTheme.spacing.m,
    elevation: 0,
    backgroundColor: appTheme.colors.surface,
    borderRadius: appTheme.borderRadius.large,
  },
  subtitle: {
    ...appTheme.typography.screenSubtitle,
    marginBottom: appTheme.spacing.m,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: appTheme.spacing.xxl,
  },
});

export default JobListScreen; 