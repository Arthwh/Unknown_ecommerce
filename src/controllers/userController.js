import UserService from '../services/userService.js';
import ProductService from '../services/productService.js';
import OrderService from '../services/orderService.js';
import { getUserAgent, getUserIP, logAction } from '../services/logsService.js';

class UserController {
    static async login(req, res) {
        try {
            const userData = req.body;
            const userIP = await getUserIP(req);
            const userAgent = await getUserAgent(req);
            const { user, message } = await UserService.login(userIP, userAgent, userData);
            req.session.user = { id: user.id, public_id: user.public_id, email: user.email, cart: { count: user.cart.count }, role: user.role };
            res.json({ user: { id: user.id, public_id: user.public_id, email: user.email, cart: user.cart, role: user.role }, message: message });
        } catch (error) {
            res.status(401).send({ message: error.message });
        }
    }

    static async logout(req, res) {
        try {
            const user = req.session.user;
            const userIP = await getUserIP(req);
            const userAgent = await getUserAgent(req);
            req.session.destroy((err) => {
                if (err) {
                    logAction(userIP, userAgent, 'user-loggout', { status: 'error', details: err.message }, user.id);
                    throw Error('Erro ao deslogar: ', err.message);
                }
                const message = 'Logout bem-sucedido!'
                logAction(userIP, userAgent, 'user-loggout', { status: 'success', details: message }, user.id);
                res.status(200).send({ message: message });
            });
        } catch (error) {
            res.status(500).send({ message: error.message });
        }
    }

    static async getUserAccountPage(req, res) {
        try {
            const user = req.session.user;
            let section = req.params.section || null;
            let itemId = req.params.itemId || null;
            let renderedSection = null;
            if (section) {
                renderedSection = await UserService.getUserPageSectionData(user, section);
            }
            if (!renderedSection && section) {
                section = null;
            }
            const categories = await ProductService.getAllProductCategoriesAndSubcategories();
            res.render('client/userConfig', {
                data: {
                    user: user, page: { categories: categories, displayRegisterModal: true }, sectionData: renderedSection, section: section
                }
            });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async getOrderDetailsPage(req, res) {
        try {
            const user = req.session.user;
            let orderId = req.params.orderId;
            if (!orderId) {
                res.status(400).send({ message: 'Order ID is required.' });
            }
            const orderData = await OrderService.getOrderDetails(user, orderId);
            const categories = await ProductService.getAllProductCategoriesAndSubcategories();
            res.render('client/userConfig', {
                data: {
                    user: user, page: { categories: categories, displayRegisterModal: true }, sectionData: orderData, section: 'orderDetails'
                }
            });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async getUserProfileComponent(req, res) {
        try {
            const user = req.session.user;
            const userProfile = await UserService.getUserProfileData(user);
            res.render("client/partials/userPageComponents/profile", { sectionData: userProfile });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao obter perfil: ' + error.message });
        }
    }

    static async getUserLogged(req, res) {
        try {
            const user = req.session.user;
            if (!user) {
                return res.send({ message: 'Usuário não logado', user: undefined });
            }
            res.send({ message: "Usuário Logado", user: user });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async createUser(req, res) {
        try {
            const userData = req.body;
            const userIP = await getUserIP(req);
            const userAgent = await getUserAgent(req);
            if (!userData) {
                res.status(400).send({ message: 'Please provide user data' });
            }
            const { userId, message } = await UserService.createUserService(userIP, userAgent, userData);
            res.status(200).send({ message: message });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async getAllUsers(req, res) {
        try {
            res.status(200).send(await UserService.getAllUsersService());
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async getUserById(req, res) {
        try {
            res.status(200).send(await UserService.getUserbyIdService(req.params.id));
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async getUserByEmail(req, res) {
        try {
            res.status(200).send(await UserService.getUserbyEmailService(req.params.email));
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async updateUser(req, res) {
        try {
            const user = req.session.user
            const userData = req.body;
            await UserService.updateUserService(user, userData);
            res.status(200).send({ message: 'User updated successfully' });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }

    static async deleteUser(req, res) {
        try {
            await UserService.deleteUserService(req.params.id);
            res.status(200).send({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(400).send({ message: error.message });
        }
    }
}

export default UserController;