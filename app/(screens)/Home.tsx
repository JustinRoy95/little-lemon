import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, FlatList } from 'react-native';
import { setData } from '@/utils/helpers';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { MenuItems, Filter, initializeDB, retrieveItems, storeItems } from '@/utils/database';
import debounce from 'lodash.debounce';



function Home() {
    const router = useRouter();

    const [image, setImage] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const [menu, setMenu] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [filters, setFilters] = useState<Filter[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let activatedFilters = filters.filter(f => f.value == true).map(f => f.name);

        if (debouncedQuery.length == 0 && activatedFilters.length == 0) {
            setFilteredData(menu);
            return;
        }

        let filteredMenu = menu;
        if (activatedFilters.length > 0 ) {
            filteredMenu = filteredMenu.filter((entry: MenuItems) => {
                return activatedFilters.includes(entry.category);
            });
        }
        if (debouncedQuery.length > 0) {
            filteredMenu = filteredMenu.filter((entry: MenuItems) => {
                return entry.name.toLowerCase().includes(debouncedQuery.toLowerCase());
            })
        }
        setFilteredData(filteredMenu);
    }, [debouncedQuery, filters]);

    const lookup = useCallback((q: string) => {
    setDebouncedQuery(q);
    }, []);

    const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

    const handleSearchChange = (text: string) => {
        setQuery(text);
        debouncedLookup(text);
    };

    const handleCategories = (items: MenuItems[]) => {
        if (filters.length) return;
        
        const cats = items.map(item => {
            return item.category;
        });
        const categories = [...new Set(cats)]
        const newFilters: Filter[] = filters;
        if (categories) {
            for (const category of categories) {
                const item: Filter = {
                    name: category,
                    value: false
                }
                newFilters.push(item);
            }
            setFilters(newFilters);
        }
    }

    const fetchData = async () => {
        try {
            const cache = await AsyncStorage.multiGet(['firstName', 'lastName', 'image']);
            const results = Object.fromEntries(cache);

            setData(results.firstName, setFirstName);
            setData(results.lastName, setLastName);
            setData(results.image, setImage);

            const db = await SQLite.openDatabaseAsync('LittleLemonDB.db');
            initializeDB(db);
            let dbData: any = await retrieveItems(db);

            if (dbData?.length) {
                setMenu(dbData);
                setFilteredData(dbData);
                handleCategories(dbData);
            } else {
                const response = await fetch('https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json');
                const json = await response.json();
                setMenu(json.menu);
                setFilteredData(json.menu);
                storeItems(db, json.menu);
                handleCategories(json.menu);
            }
        }
        catch (error) {
            console.log("Error fetching data: ", error);
        }
    }

    const renderItem = ({item}: {item: MenuItems}) => {
        return (
            <View style={styles.menuItemContainer}>
                <View style={styles.leftPanel}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    { item.description.length > 64 ?
                        <Text style={styles.itemDescription}>{item.description.substring(0, 64)}...</Text>
                        :
                        <Text style={styles.itemDescription}>{item.description}</Text>
                    }
                    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.rightPanel}>
                    <Image
                        source={{uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${item.image}?raw=true`}}
                        style={styles.image}
                    />
                </View>
            </View>
        )
    }

    const renderFilter = (filter: any) => {
        return (
            <Pressable
                onPress={() => {
                    setFilters(filters.map(item => {
                        if (item.name == filter.item.name) {
                            return {...item, value: !filter.item.value};
                        }
                        return item;
                    }));
                }}
                style={[
                    styles.filterButton, 
                    filter.item.value ? 
                        {backgroundColor: '#656565ff'}
                        : 
                        {backgroundColor: '#d6d6d6ff'}]}
            >
                <Text style={styles.filterText}>{filter.item.name}</Text>
            </Pressable>
        );
    }

    return (
        <>
            <View style={styles.header}>
                <View style={styles.spacer}>

                </View>
                <Image 
                    source={require('../../assets/images/Logo.png')}
                    resizeMode='stretch'
                    
                />
                <Pressable onPress={() => router.replace('/Profile')} style={styles.profilePlaceholder}>
                    { image ?
                        <Image source={{uri: image}} style={styles.profilePic} />
                    :
                        <Text style={styles.profileLetters}>{firstName[0]}{lastName && lastName[0]}</Text>
                    }
                </Pressable>
            </View>

            <View style={styles.body}>
                <Text style={styles.title}>Little Lemon</Text>
                <View style={styles.panelOverview}>
                    <View style={styles.panelLeft}>
                        <Text style={styles.subTitle}>Chicago</Text>
                        <Text style={styles.description}>
                            We are a family owned
                            Mediterranean restaurant,
                            focused on traditional
                            recipes served with a
                            modern twist.
                        </Text>
                    </View>
                    <View style={styles.panelRight}>
                        <Image
                            style={styles.hero}
                            resizeMode='stretch'
                            source={require('../../assets/images/Hero\ image.png')} />
                    </View>
                </View>
                <View style={styles.search}>
                    <Ionicons
                        name='search-outline'
                        style={styles.icon}
                        size={30}
                        />
                    <TextInput
                        style={styles.querySearch}
                        value={query}
                        onChangeText={handleSearchChange}
                    />
                </View>
            </View>
            
            <View style={styles.list}>
                <Text style={styles.boldText}>ORDER FOR DELIVERY!</Text>
                <View style={styles.filters}>
                    <FlatList
                        horizontal={true}
                        data={filters}
                        renderItem={renderFilter}
                        keyExtractor={item => {
                            return item.name
                        }}
                    />
                </View>
                <FlatList
                    data={filteredData}
                    renderItem={renderItem}
                    keyExtractor={item => item.name}
                />
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    spacer: {
        paddingLeft: 15,
        width: 'auto'
    },
    profilePlaceholder: {
        marginRight: 15,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileLetters: {
        fontSize: 20,
        height: 40,
        width: 40,
        borderWidth: 1,
        borderRadius: 20,
        textAlignVertical: 'center',
        textAlign: 'center'
    },
    profilePic: {
        height: 40,
        width: 40,
        borderRadius: 20,
        marginRight: 15
    },
    body: {
        flex: 4,
        backgroundColor: '#364e46ff'
    },
    title: {
        fontSize: 40,
        color: '#f4b814ff',
        paddingLeft: 15,
        paddingTop: 5,
        height: 48,
    },
    subTitle: {
        fontSize: 30,
        color: '#ffffff',
        paddingLeft: 15,
        paddingBottom: 10
    },
    description: {
        fontSize: 18,
        color: '#ffffff',
        paddingLeft: 15,
        lineHeight: 25,
    },
    hero: {
        width: 150,
        height: 150,
        borderRadius: 20
    },
    panelOverview: {
        flexDirection: 'row'
    },
    panelLeft: {
        width: '55%',
    },
    panelRight: {
        width: '45%',
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    search:{
        marginHorizontal: 25,
        marginTop: 20,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        borderRadius: 10
    },
    icon: {
        marginLeft: 10,
    },
    querySearch: {
        paddingLeft: 10,
        width: '85%',
    },
    list: {
        flex: 6,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    boldText: {
        fontSize: 16,
        fontWeight: '700',
        paddingBottom: 5
    },
    filters: {
        flexDirection: 'row',
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderColor: '#949494ff'
    },
    filterButton: {
        marginRight: 20,
        marginVertical: 10,
        borderRadius: 10
    },
    filterText: {
        color: '#364e46ff',
        fontWeight: 'bold',
        paddingHorizontal: 8,
        paddingVertical: 4
    },
    menuItemContainer: {
        flexDirection: 'row',
        marginTop: 15,
        borderBottomWidth: 1,
        borderColor: '#d5d5d5ff',
        paddingBottom: 15,
    },
    leftPanel: {
        width: '60%'
    },
    rightPanel: {
        width: 'auto'
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        paddingBottom: 10
    },
    itemDescription: {
        color: '#364e46ff',
        paddingBottom: 10,
        paddingRight: 10
    },
    itemPrice: {
        color: '#313131ff',
        fontSize: 16,
        fontWeight: '500'
    },
    image: {
        height: 100,
        width: 100,
    },
});

export default Home