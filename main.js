import Scrollbar from "https://cdn.skypack.dev/smooth-scrollbar@8.8.4";
import { ScrollbarPlugin } from "https://cdn.skypack.dev/smooth-scrollbar@8.8.4";

class AnchorPlugin extends ScrollbarPlugin {
	static pluginName = "anchor";

	onHashChange = () => {
		this.jumpToHash(window.location.hash);
	};

	onClick = (event) => {
		const { target } = event;

		if (target.tagName !== "A") {
			return;
		}

		const hash = target.getAttribute("href");

		if (!hash || hash.charAt(0) !== "#") {
			return;
		}

		this.jumpToHash(hash);
	};

	jumpToHash = (hash) => {
		const { scrollbar } = this;

		if (!hash) {
			return;
		}

		// reset scrollTop
		scrollbar.containerEl.scrollTop = 0;

		scrollbar.scrollIntoView(document.querySelector(hash));
	};

	onInit() {
		this.jumpToHash(window.location.hash);

		window.addEventListener("hashchange", this.onHashChange);

		this.scrollbar.contentEl.addEventListener("click", this.onClick);
	}

	onDestory() {
		window.removeEventListener("hashchange", this.onHashChange);

		this.scrollbar.contentEl.removeEventListener("click", this.onClick);
	}
}

const Option = {
	damping: 0.08,
};

Scrollbar.use(AnchorPlugin);

const scrollbar = Scrollbar.init(document.querySelector("#viewport"), Option);

const gallery = document.querySelector(".gallery"),
	viewport = document.querySelector("#viewport"),
	details = document.querySelectorAll(".details"),
	images = document.querySelectorAll(".image");

const colors = [
	"#FFA756",
	"#B9C7EC",
	"#FD9BCF",
	"#e665e9",
	"#fcfc5c",
	"#FFFFFF",
];

const totalImages = images.length;
const maxA = (totalImages - 1) * 100;

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

var pintop, pinbottom, bound;
function refresh() {
	pintop = scrollbar.offset.y + gallery.getBoundingClientRect().top;
	pinbottom =
		scrollbar.offset.y +
		gallery.getBoundingClientRect().bottom -
		pintop -
		window.innerHeight;

	bound = Array.from(details).map(
		(detail) =>
			scrollbar.offset.y +
			detail.getBoundingClientRect().top -
			Math.round(window.innerHeight / 2)
	);
	bound.unshift(0);
	bound.push(
		scrollbar.offset.y +
			gallery.getBoundingClientRect().bottom -
			Math.round(window.innerHeight / 2)
	);

	pinImage(scrollbar.offset);
	getColor(scrollbar.offset);
	clipImage(scrollbar.offset);
}
refresh();

function pinImage(offset) {
	// Calculate the transformed translateY value using clamp
	const transform = clamp(offset.y - pintop, 0, pinbottom);

	// Apply the transform to the element with class "right-side"
	document.querySelector(
		".right-side"
	).style.transform = `translateY(${transform}px)`;
}

function getColor(offset) {
	// Iterate through the colors and bound arrays in reverse order
	for (let i = colors.length - 1; i >= 0; i--) {
		if (offset.y > bound[i]) {
			viewport.style.backgroundColor = colors[i];
			return; // Exit the loop once a match is found
		}
	}
}

function clipImage(offset) {
	// Calculate 'a' based on the offset, pintop, and pinbottom
	let a = Math.round(((offset.y - pintop) / pinbottom) * maxA);

	// Clamp 'a' to ensure it stays within a valid range
	a = Math.min(Math.max(a, 0), maxA);

	// Apply the clipPath to each image using a single loop
	images.forEach((Val, Index) => {
		Val.style.clipPath = `inset(0 0 ${Math.max(a - Index * 100, 0)}% 0)`;
	});
}

scrollbar.addListener((status) => {
	pinImage(status.offset);
	getColor(status.offset);
	clipImage(status.offset);
});
