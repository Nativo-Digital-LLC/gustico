import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useGetEstablishmentByDomain } from '../hooks/useEstablishments';
import { Header, SubcategoryCard, CategoriesMenu, EstablishmentInfo, ModalNewCategory } from '../components';
import { useSessionStore } from '../store/session';

export default function MenuPage() {
	const { establishmentUrl } = useParams();
	const session = useSessionStore(({ session }) => session);
	const location = useLocation();
	const navigate = useNavigate();

	const [establishment, loading, error, reload] = useGetEstablishmentByDomain(establishmentUrl);
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
		if (!establishment || establishment.categories.length === 0) {
			return;
		}

		const category = establishment
			.categories
			.find(({ order }) => order === 1);

		if (!category) {
			return;
		}

		handleUrlChanges('categoryId', category.$id);
	}, [establishment]);

	if (error) {
		return <p>Error, {JSON.stringify(error, null, 4)}</p>
	}

	if (loading) {
		return null;
	}

	if (!establishment) {
		return <p>No encontrado</p>;
	}

	function handleUrlChanges(key: string, value: string) {
		const params = new URLSearchParams(location.search);
		params.set(key, value);
		navigate(`${location.pathname}?${params.toString()}`);
	}

	return (
		<div style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
			<div style={{ maxWidth: 560, margin: '0 auto', height: '100vh', backgroundColor: '#FFF' }}>
				<Header
					bannerUrl={establishment.bannerUrl ?? undefined}
					logoUrl={establishment.logoUrl ?? undefined}
				/>
				<div
					style={{
						borderRadius: 30,
						marginTop: -30,
						width: '100%',
						height: 'calc(100vh - 132px)',
						zIndex: 100,
						backgroundColor: '#FFF',
						padding: 20,
						overflowY: 'scroll',
					}}
					className='hide-scrollbar-y'
				>
					<EstablishmentInfo
						name={establishment.name}
						description={establishment.description}
						phone={establishment.phone + ''}
						address={establishment.address}
					/>
					<br />
					<br />

					<CategoriesMenu
						categories={establishment.categories}
						selectedCategoryId={selected.categoryId ?? undefined}
						color={establishment.mainHexColor}
						onChange={(id) => handleUrlChanges('categoryId', id)}
						establishmentId={establishment.$id}
						isEditable={isEditable}
					/>
					<br />
					<br />

					<input
						placeholder='Buscar'
						style={{
							border: 'none',
							backgroundColor: 'rgba(0, 0, 0, 0.1)',
							width: '100%',
							padding: '10px 20px',
							borderRadius: 30,
							fontSize: 14
						}}
					/>
					<br />
					<br />

					{!selected.subcategoryId && selectedCategory?.subcategories?.map((subcategory) => {
						const { $id, name, photoUrl } = subcategory;
						return (
							<SubcategoryCard
								key={$id}
								name={name}
								photoUrl={photoUrl ?? undefined}
								onPress={() => handleUrlChanges('subcategoryId', $id)}
							/>
						);
					})}
				</div>
			</div>

			<ModalNewCategory
				onFinish={() => reload(establishmentUrl!)}
			/>
		</div>
	);
}
