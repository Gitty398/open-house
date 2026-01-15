const express = require("express");
const router = express.Router({ mergeParams: true });
const Listing = require("../models/listing");

// I.N.D.U.C.E.S

// INDEX GET /listings/
router.get("/", async (req, res) => {
    const listings = await Listing.find().populate("owner");
    res.render('listings/index.ejs', { listings });
});

// New

router.get("/new", (req, res) => {
    res.render("listings/new.ejs")
})

// Delete
router.delete("/:listingId", async (req, res) => {
    try {
        // await Listing.findByIdAndDelete(req.params.listingId)
        const foundListing = await Listing.findById(req.params.listingId);

        if (!foundListing.owner._id.equals(req.session.user._id)) {
            throw new Error("You must own this property to delete it");
        }

        await foundListing.deleteOne()
        res.redirect("/listings")

    } catch (error) {
        console.log(error);
        req.session.message = error.message;
        req.session.save(() => {
            res.redirect(`/listings/${req.params.listingId}`);
        });
    }
});


// Update
router.put("/:listingId", async (req, res) => {
    try {
        const foundListing = await Listing.findById(req.params.listingId);
        if (!foundListing.owner._id.equals(req.session.user._id)) {
            throw new Error("You must own this property to update it");
        }

        await foundListing.updateOne(req.body);

        res.redirect("/listings");
    } catch (error) {
        console.log(error);
        req.session.message = error.message;
        req.session.save(() => {
            res.redirect("/listings");
        });
    }
});



// Create

router.post("/", async (req, res) => {
    try {
        const { city, streetAddress } = req.body

        if (!city.trim()) throw new Error("City requires a proper city")
        if (!streetAddress.trim()) throw new Error("Please provide a proper address")
        // if (size < 0 || size === "") throw new Error("Please provide a size greather than 0")
        // if (size < 0 || price === "") throw new Error("Please provide a price greather than $0")

        req.body.owner = req.session.user._id
        await Listing.create(req.body)
        res.redirect("/listings")

    } catch (error) {
        console.log(error)
        req.session.message = error.message
        req.session.save(() => {
            res.redirect("/listings/new")
        })
    }

})

// Seed Route (load some sample data)
router.get("/seed", async (req, res) => {
    await Listing.create([
        {
            streetAddress: "12211 Whatever St., LA, CA, 90000",
            price: 10000000,
            size: 1600,
            city: "Los Angeles",
        },
        {
            streetAddress: "1000 Some St., LA, CA, 90000",
            price: 500000,
            size: 1600,
            city: "West Hills",
        },
        {
            streetAddress: "3414 Whatever St., LA, CA, 90000",
            price: 200,
            size: 1600000,
            city: "Inglewood",
        },
    ]);

    res.redirect("/listings");
});

// Edit
router.get('/:listingId/edit', async (req, res) => {
    try {
        const foundListing = await Listing.findById(req.params.listingId)
        console.log(req.params);
        if (!foundListing)
            throw new Error(
                `Failed to find a property with id ${req.params.listingId}`
            );
        res.render("listings/edit.ejs", { listing: foundListing });
    } catch (error) {
        console.log(error);
        req.session.message = error.message;
        req.session.save(() => {
            res.redirect("/listings");
        });
    }
})




// Show GET /:listingId

router.get("/:listingId", async (req, res) => {
    try {
        const foundListing = await Listing.findById(req.params.listingId).populate(
            "owner"
        );
        console.log(req.params);
        if (!foundListing)
            throw new Error(
                `Failed to find a property with id ${req.params.listingId}`
            );
        res.render("listings/show.ejs", { listing: foundListing });
    } catch (error) {
        console.log(error);
        req.session.message = error.message;
        req.session.save(() => {
            res.redirect("/listings");
        });
    }
});


module.exports = router;
