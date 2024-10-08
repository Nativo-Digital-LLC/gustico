import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Row, Typography } from 'antd';
import {
	InfiniteHits,
	InstantSearch,
	SearchBox,
	Configure
} from 'react-instantsearch';
import 'instantsearch.css/themes/satellite.css';

import { useGetEstablishmentByDomain } from '../../hooks/useEstablishments';
import {
	ModalCategory,
	SubcategoriesList,
	ProductsList,
	ModalSubcategory,
	MenuFooter,
	MenuHeader,
	EstablishmentInfo,
	CategoriesMenu,
	ProductCard
} from './components';
import { useSessionStore } from '../../store/session';
import { ModalEstablishment } from '../../components';
import searchClient from '../../utils/search';
import { ProductProps } from '../../types/Product';

const { Text } = Typography;

export default function MenuPage() {
	const { establishmentUrl } = useParams();
	const session = useSessionStore(({ session }) => session);
	const location = useLocation();
	const navigate = useNavigate();

	const [establishment, loading, error, reload] = useGetEstablishmentByDomain(establishmentUrl);
	const [search, setSearch] = useState('');

	const isEditable = useMemo(() => {
		return establishment && session && session.userId === establishment.userId || false;
	}, [session, establishment]);
	const selected = useMemo(() => {
		const params = new URLSearchParams(location.search);
		const categoryId = params.get('categoryId');
		const subcategoryId = params.get('subcategoryId');

		return {
			categoryId,
			subcategoryId
		}
	}, [location]);
	const selectedCategory = useMemo(() => {
		if (!selected.categoryId || !establishment || establishment.categories.length === 0) {
			return null;
		}

		return establishment.categories.find(({ $id }) => $id === selected.categoryId) || null
	}, [establishment, selected.categoryId]);

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const categoryId = params.get('categoryId');
		if (!establishment || establishment.categories.length === 0 || categoryId) {
			return;
		}

		const category = establishment
			.categories
			.find(({ order }) => order === 1);

		if (category) {
			handleUrlChanges('categoryId', category.$id);
		}
	}, [establishment]);

	useEffect(() => {
		if (selected.subcategoryId) {
			const div = document.getElementById('main_container');
			if (div) {
				div.scrollTo({
					top: 200,
					behavior: 'smooth'
				});
			}
		}
	}, [selected?.subcategoryId]);

	if (error) {
		return <p>Error, {JSON.stringify(error, null, 4)}</p>
	}

	if (loading && !establishment) {
		return null;
	}

	if (!establishment) {
		return <p>No encontrado</p>;
	}

	function handleUrlChanges(key: string, value: string, reset = false) {
		const params = new URLSearchParams(location.search);
		if (reset) {
			const keys = Object.keys(
				Object.fromEntries(params.entries())
			);

			for (const key of keys) {
				params.delete(key);
			}
		}

		params.set(key, value);
		navigate(`${location.pathname}?${params.toString()}`);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function handleSearchInput({ target }: any) {
		setSearch(target.value)
	}

	return (
		<InstantSearch
			indexName='products'
			searchClient={searchClient}
		>
			<div style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
				<div
					style={{
						maxWidth: 560,
						margin: '0 auto',
						backgroundColor: '#FFF',
						display: 'flex',
						flexDirection: 'column'
					}}
				>
					<MenuHeader
						bannerUrl={establishment.bannerUrl ?? undefined}
						logoUrl={establishment.logoUrl ?? undefined}
						isEditable={isEditable}
					/>
					<div
						style={{
							borderRadius: 30,
							marginTop: -30,
							width: '100%',
							flex: 1,
							zIndex: 100,
							backgroundColor: '#FFF',
							padding: 20
						}}
						className='hide-scrollbar-y'
						id='main_container'
					>
						<EstablishmentInfo
							establishment={establishment}
							isEditable={isEditable}
						/>
						<br />
						<br />

						<CategoriesMenu
							categories={establishment.categories}
							selectedCategoryId={selected.categoryId ?? undefined}
							color={establishment.mainHexColor}
							onSelect={(id) => handleUrlChanges('categoryId', id, true)}
							onChange={() => reload(establishmentUrl!)}
							establishmentId={establishment.$id}
							isEditable={isEditable}
						/>
						<br />

						<SearchBox
							onChangeCapture={handleSearchInput}
							onResetCapture={() => setSearch('')}
							placeholder='Buscar'
						/>
						{search.length > 0 && (
							<>
								<InfiniteHits
									hitComponent={({ hit }) => (
										<ProductCard
											key={hit.$id}
											data={hit as unknown as ProductProps}
											color={establishment.mainHexColor}
											preview
										/>
									)}
								/>
								<Configure
									filters={`establishmentId="${establishment.$id}"`}
								/>
							</>
						)}

						<SubcategoriesList
							subcategories={selectedCategory?.subcategories || []}
							mainColor={establishment.mainHexColor}
							isEditable={isEditable}
							category={{
								name: selectedCategory?.name || '',
								id: selectedCategory?.$id || ''
							}}
							show={!selected.subcategoryId && search.length === 0}
							onChange={() => reload(establishmentUrl!)}
							onPress={(id) => handleUrlChanges('subcategoryId', id)}
						/>

						<ProductsList
							show={!!selected.subcategoryId && search.length === 0}
							color={establishment.mainHexColor}
							establishmentId={establishment.$id}
							categoryId={selected.categoryId + ''}
							subcategoryId={selected.subcategoryId + ''}
							subcategoryName={
								selectedCategory
									?.subcategories
									?.find(({ $id }) => $id === selected.subcategoryId)
									?.name + ''
							}
							isEditable={isEditable}
						/>

						<Row justify='center'>
							<a
								href='https://goqr.com.do'
								target='_blank'
							>
								<Text>goqr.com.do</Text>
							</a>
						</Row>
					</div>

					{isEditable && (
						<MenuFooter domain={establishmentUrl!} />
					)}
				</div>

				<ModalCategory
					onFinish={() => reload(establishmentUrl!)}
				/>

				<ModalEstablishment
					onFinish={() => reload(establishmentUrl!)}
				/>

				<ModalSubcategory
					onFinish={() => reload(establishmentUrl!)}
				/>
			</div>
		</InstantSearch>
	);
}
