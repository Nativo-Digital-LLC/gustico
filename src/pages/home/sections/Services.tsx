import services from "../constants/Services";
import dot from "../../../assets/images/services/dot.svg";

export default function Services() {
	return (
		<div className="h-auto bg-[--tertiary] py-[40px] pt px-[20px] relative z-[3]">
			<div className="text-center">
				<h2 className="text-[25px] font-[700] mb-[40px]">
					QrCode menu service includes
				</h2>
			</div>
			<div>
				<ul className="sm:flex sm:flex-wrap sm:columns-2 sm:justify-between sm:[&>*:nth-child(odd)]:mr-[10px] sm:[&>*:nth-child(even)]:ml-[10px]">
					{services.map((item, index) => (
						<div className="mb-[20px] sm:flex sm:flex-[40%]">
							<img
								src={dot}
								alt={`dot-${index}`}
								className="h-[11px] w-[12px] mt-[7px]"
							/>
							<li className="text-[15px] pl-[15px]" key={index}>
								{item}
							</li>
						</div>
					))}
				</ul>
			</div>
		</div>
	);
}
